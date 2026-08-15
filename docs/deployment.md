# Guia de Deploy — DevDock

> **Status:** Atualizado

## Deploy Recomendado (Vercel)

A plataforma **DevDock** é construída em **Next.js 15 App Router**, tornando a Vercel a plataforma recomendada para deploy de produção com zero configuração extra.

### Passos para Deploy na Vercel

1. Faça push do repositório para o GitHub (`main` branch).
2. Conecte o repositório no dashboard da Vercel (`https://vercel.com`).
3. Em **Environment Variables**, adicione as variáveis declaradas em `.env.example`:
   - `NEXTAUTH_URL` (URL final da sua aplicação na Vercel)
   - `NEXTAUTH_SECRET`
   - `DATABASE_URL` / `DIRECT_URL` (Se utilizar sincronização PostgreSQL/Supabase)
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` (Para Web Push)
4. Clique em **Deploy**.

---

## Deploy Alternativo (Docker / Node.js Standalone)

### Comandos de Build de Produção

```bash
npm run build
npm start
```

### Configurações de Build

- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Node Version**: `>= 18.x`
