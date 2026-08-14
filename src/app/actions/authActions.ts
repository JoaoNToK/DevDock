'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { signUpSchema, signInSchema, SignUpInput, SignInInput } from '@/lib/validations/auth';

export async function registerUserAction(input: SignUpInput) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
    throw new Error(errorMsg);
  }

  const { name, email, password } = parsed.data;

  // Check existing user in PostgreSQL
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Este e-mail já está cadastrado. Por favor, faça login!');
  }

  // Secure Password Hashing
  const passwordHash = await bcrypt.hash(password, 10);

  // Create User in PostgreSQL
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      userSettings: {
        create: {
          theme: 'system',
          focusDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          volume: 0.8,
          dailyGoal: 8,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    user: newUser,
  };
}

export async function loginUserAction(input: SignInInput) {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
    throw new Error(errorMsg);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    throw new Error('E-mail ou senha incorretos.');
  }

  // Verify bcrypt password hash
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('E-mail ou senha incorretos.');
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    },
  };
}
