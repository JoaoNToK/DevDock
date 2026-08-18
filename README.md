# DevDock V2 — Plataforma Profissional de Foco, Produtividade e Organização (v2.0.0)

[![Next.js](https://img.shields.io/badge/Next.js-15.5.23-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/Version-v2.0.0-indigo?style=flat-square)](https://dev-dock-jade.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)

**DevDock V2** é uma plataforma profissional full-stack com sincronização na nuvem (PostgreSQL / Supabase), colaboração multi-usuário (RBAC), busca global (`Ctrl+K`), notificações Web Push e analytics avançado.

---

## ⚡ Principais Funcionalidades

- 🍅 **Pomodoro Timer & Cronômetro**: Temporizador reativo com cálculo de tempo em background por timestamp, alertas PWA e histórico de sessões.
- 🚀 **Projetos & Kanban Interativo**: Gerenciador único de Tarefas com quadro Kanban com Drag & Drop (`@dnd-kit`), prioridades, prazos e atalho direto para foco.
- 📅 **Calendário Unificado**: Núcleo de planejamento temporal com visões integradas de Dia, Semana e Mês combinando eventos, atividades diárias, tarefas de projetos e entregas acadêmicas.
- 🎓 **Módulo Acadêmico / Faculdade**: Gestão de semestres, matérias, notas (P1/P2) e entrega de trabalhos.
- 📊 **Relatórios de Produtividade**: Gráficos nativos de tempo focado e estatísticas de conclusão.
- 💾 **Persistência Local-First & Sincronização Multi-Aba**: `storageAdapter` seguro com reatividade síncrona entre abas abertas.
- 📱 **Web Push & PWA**: Instalável como aplicativo nativo em desktop/mobile com suporte a notificações push via Service Worker.
- 🎨 **Design System Monocromático**: Identidade visual oficial em 10 tons com suporte a Dark Mode, Light Mode e Sistema.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.1.0 (App Router, Server Components & Client Components)
- **Linguagem**: TypeScript 5.4.5
- **Estilização**: Tailwind CSS 3.4.1
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Autenticação**: NextAuth.js 4.24.15 (Credentials & Google OAuth)
- **Banco de Dados / ORM**: PostgreSQL (Supabase) + Prisma ORM 6.19.3
- **Testes**: Suíte de testes automatizados (`npm test`)

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js `>= 18.x`
- npm

### 1. Clonar o Repositório e Instalar Dependências

```bash
git clone https://github.com/JoaoNToK/DevDock.git
cd DevDock
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.local
```

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse em `http://localhost:3000`.

---

## 🧪 Suíte de Testes Automatizados

Para executar a suíte de testes unitários e de integração do DevDock:

```bash
npm test
```

Para verificar os tipos estáticos com o compilador TypeScript:

```bash
npx tsc --noEmit
```

---

## 📚 Documentação Técnica Oficial

A documentação detalhada da arquitetura, regras de negócio e módulos está disponível no diretório [`docs/`](./docs/):

- 🏗️ [**Arquitetura do Sistema**](./docs/architecture.md)
- 📋 [**Requisitos Funcionais e Não Funcionais**](./docs/requirements.md)
- 💾 [**Camada de Dados e Persistência**](./docs/database.md)
- 🔐 [**Regras de Negócio**](./docs/business-rules.md)
- 🧪 [**Estratégia de Testes**](./docs/testing.md)
- 🗺️ [**Roadmap Oficial**](./docs/roadmap.md)
- 💻 [**Guia de Desenvolvimento**](./docs/development.md)
- 🚀 [**Guia de Deploy**](./docs/deployment.md)

---

## 🧩 Módulos do Sistema

| Módulo | Descrição | Documentação |
| :--- | :--- | :--- |
| **Pomodoro** | Temporizador de foco e cronômetro com background preciso | [Documentação](./docs/modules/pomodoro.md) |
| **Projetos** | Gestão de projetos com métricas de tempo e arquivos | [Documentação](./docs/modules/projects.md) |
| **Kanban** | Quadro Kanban arrastável com reordenação de tarefas | [Documentação](./docs/modules/kanban.md) |
| **Estudos** | Controle de disciplinas, matérias e anotações | [Documentação](./docs/modules/studies.md) |
| **Faculdade** | Organização acadêmica de semestres, provas e notas | [Documentação](./docs/modules/college.md) |
| **Calendário** | Grade unificada de eventos, provas e prazos | [Documentação](./docs/modules/calendar.md) |
| **Tarefas** | Gerenciador de tarefas com checklists e prioridades | [Documentação](./docs/modules/tasks.md) |
| **Relatórios** | Estatísticas de produtividade e gráficos | [Documentação](./docs/modules/reports.md) |

---

## 📄 Licença e Segurança

- Consulte a [Licença MIT](./LICENSE) para informações de uso e distribuição.
- Para reportar vulnerabilidades de segurança, veja nossa [Política de Segurança](./SECURITY.md).
