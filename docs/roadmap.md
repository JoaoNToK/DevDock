# Roadmap do Projeto — DevDock

> **Status:** Atualizado (V1 Finalizada e Pronta para V2)

## ✅ Concluído na V1 (v1.0.0 Estável)

- [x] **Pomodoro & Cronômetro**: Timer de foco reativo com execução precisa por timestamp e Notificações Web Push.
- [x] **Projetos & Kanban**: Colunas personalizáveis, Drag & Drop (`@dnd-kit`), prioridades, tags e notas estilo Google Keep.
- [x] **Estudos & Faculdade**: Gerenciador de matérias, semestres, avaliações, trabalhos e Central de Arquivos & Links com vínculos a Disciplina, Trabalho e Entrega.
- [x] **Tarefas Autônomas**: Rota independente `/tarefas` no estilo Google Tasks com suporte a subtarefas, categorias e filtro por projeto.
- [x] **Categorias Personalizáveis**: Gestor de categorias personalizadas com nome, ícone e cores HSL.
- [x] **Calendário Unificado**: Visão consolidada (Geral, Semanal, Diária) de eventos, tarefas e avaliações acadêmicas.
- [x] **Design System Monocromático**: Identidade visual refinada de alta legibilidade.
- [x] **Persistência Local-First & Sincronização Multi-Aba**: `storageAdapter` namespaced com reatividade instantânea.
- [x] **Backup & Restauração**: Exportação/Importação JSON com suporte completo a categorias, notas e arquivos.
- [x] **Suíte de Testes Automatizados**: 16/16 testes unitários e de integração (`npm test`).
- [x] **Quality Gate**: 0 erros de lint, 0 erros de TypeScript e build de produção 100% verificado (`34/34` páginas).

---

## 🚀 Planejado para a V2 (Pós-Deploy)

Consulte a documentação completa da V2 em [`docs/v2-readiness.md`](./v2-readiness.md).

- [ ] **FASE 1 — PostgreSQL & Prisma Schema Migration**: Transição do Local-First para tabelas PostgreSQL no Supabase.
- [ ] **FASE 2 — Cloud Sync Bidirecional**: Sincronização multi-dispositivo PC $\leftrightarrow$ Celular com indicador de status no Header.
- [ ] **FASE 3 — Google Calendar Integration**: Sincronização bidirecional de eventos e avaliações via OAuth 2.0.
- [ ] **FASE 4 — Storage de Anexos na Nuvem**: Armazenamento seguro de arquivos em Cloud Storage (S3/Supabase Storage).
- [ ] **FASE 5 — Sincronização em Tempo Real (Realtime)**: Atualização instantânea cross-device via WebSockets/SSE.
- [ ] **FASE 6 — Colaboração & Compartilhamento de Projetos**: Suporte a múltiplos membros com permissões RBAC.
- [ ] **FASE 7 — Busca Global (`Ctrl` / `Cmd` + `K`)**: Command Palette para pesquisa rápida em todo o app.
- [ ] **FASE 8 — Web Push Notifications Centralizado**: Motor de agendamento de lembretes e notificações de entregas.
- [ ] **FASE 9 — Atalhos de Teclado Universais**: Navegação ágil no navegador e PWA via teclado.
- [ ] **FASE 10 — Analytics & Dashboards Avançados**: Relatórios consolidados de foco e produtividade.
