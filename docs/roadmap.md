# Roadmap do Projeto — DevDock

> **Status:** Atualizado

## ✅ Concluído (v0.1.0)

- [x] **Pomodoro & Cronômetro**: Timer de foco reativo com execução precisa em background.
- [x] **Projetos & Kanban**: Colunas personalizáveis, Drag & Drop (`@dnd-kit`), prioridades e tags.
- [x] **Estudos & Faculdade**: Gerenciador de matérias, semestres, avaliações e relatórios.
- [x] **Calendário Unificado**: Integração automática com prazos da faculdade e projetos.
- [x] **Notificações Web Push**: Suporte a Service Worker, VAPID e Notification API.
- [x] **Design System Monocromático**: Identidade visual oficial em 10 tons de preto, cinza e branco com suporte Dark/Light/Sistema.
- [x] **Persistência Local-First & Sincronização Multi-Aba**: `storageAdapter` namespaced com subscrição reativa.
- [x] **Backup & Restauração**: Exportação/Importação JSON validado.
- [x] **Suíte de Testes Automatizados**: 16/16 testes unitários e de integração (`npm test`).
- [x] **Otimizações de Performance & Error Boundaries**: Lazy loading, memoização e captura de exceções Next.js 15.

---

## 🟡 Em Andamento / Próximos Passos

- [ ] **Sincronização em Nuvem em Segundo Plano**: Aprimoramento da sincronização bidirecional com Supabase PostgreSQL para contas autenticadas.
- [ ] **Modo Offline com IndexDB**: Expandir suporte local para armazenamento de arquivos anexos pesados.

---

## 🔵 Planejado / Futuro

- [ ] **Integração com Google Calendar**: Sincronização bidirecional de eventos acadêmicos e pessoais.
- [ ] **Compartilhamento de Quadros Kanban**: Colaboração em tempo real entre equipes.
