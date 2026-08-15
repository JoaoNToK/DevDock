import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Informe o e-mail e a senha.');
        }

        const cleanEmail = credentials.email.toLowerCase().trim();

        // Query user from PostgreSQL
        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (!user || !user.passwordHash) {
          throw new Error('E-mail ou senha incorretos.');
        }

        // Compare bcrypt password hash securely
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('E-mail ou senha incorretos.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;
        const cleanEmail = user.email.toLowerCase().trim();

        try {
          // Upsert Google user in PostgreSQL database
          const dbUser = await prisma.user.upsert({
            where: { email: cleanEmail },
            update: {
              name: user.name || 'Usuário Google',
              image: user.image || undefined,
            },
            create: {
              name: user.name || 'Usuário Google',
              email: cleanEmail,
              image: user.image || undefined,
            },
          });
          user.id = dbUser.id;
        } catch (error) {
          console.error('Error upserting Google user in database:', error);
          user.id = user.id || cleanEmail;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider || 'credentials';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; provider?: string }).id = token.id as string;
        (session.user as { id?: string; provider?: string }).provider = token.provider as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};
