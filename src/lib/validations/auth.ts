import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z
    .string()
    .email('E-mail inválido')
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export const signInSchema = z.object({
  email: z
    .string()
    .email('E-mail inválido')
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Informe a senha'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
