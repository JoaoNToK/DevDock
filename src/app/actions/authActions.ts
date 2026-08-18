'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { signUpSchema, signInSchema, SignUpInput, SignInInput } from '@/lib/validations/auth';

export async function registerUserAction(input: SignUpInput) {
  try {
    const parsed = signUpSchema.safeParse(input);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return { success: false, error: errorMsg };
    }

    const { name, email, password } = parsed.data;

    // Check existing user in PostgreSQL
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'Este e-mail já está cadastrado. Por favor, faça login!' };
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
  } catch (error) {
    console.error('registerUserAction error:', error);
    return { success: false, error: (error as Error).message || 'Erro ao realizar cadastro.' };
  }
}

export async function loginUserAction(input: SignInInput) {
  try {
    const parsed = signInSchema.safeParse(input);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return { success: false, error: errorMsg };
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }

    // Verify bcrypt password hash
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return { success: false, error: 'E-mail ou senha incorretos.' };
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
  } catch (error) {
    console.error('loginUserAction error:', error);
    return { success: false, error: (error as Error).message || 'E-mail ou senha incorretos.' };
  }
}
