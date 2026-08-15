# Requisitos do Sistema — DevDock

> **Status:** Atualizado

## Requisitos Funcionais (RF)

| ID | Requisito | Status | Descrição |
| :--- | :--- | :--- | :--- |
| **RF01** | **Pomodoro Timer & Cronômetro** | ✅ Implementado | Temporizador configurável (Work, Short Break, Long Break), suporte a modo Cronômetro e execução precisa em background. |
| **RF02** | **Gerenciamento de Projetos** | ✅ Implementado | Criação, edição, arquivamento e exclusão de projetos com cor, ícone, prioridade e status. |
| **RF03** | **Quadro Kanban Interativo** | ✅ Implementado | Colunas personalizáveis com Drag & Drop de tarefas (`@dnd-kit`), ordenação, prioridades e atalho direto para Foco. |
| **RF04** | **Planejamento Diário e Semanal** | ✅ Implementado | Agendamento de atividades com horários (start/end), status de conclusão e vincular a disciplinas. |
| **RF05** | **Módulo Acadêmico & Faculdade** | ✅ Implementado | Gestão de semestres, disciplinas, professores, salas, avaliações/provas e trabalhos com notas. |
| **RF06** | **Calendário Unificado** | ✅ Implementado | Calendário mensal/semanal integrando eventos personalizados, prazos de tarefas de projetos e avaliações da faculdade. |
| **RF07** | **Relatórios de Produtividade** | ✅ Implementado | Estatísticas visuais de tempo focado, contagem de sessões por modo, gráficos de distribuição e taxa de metas. |
| **RF08** | **Sistema de Backup & Restauração** | ✅ Implementado | Exportação de arquivo JSON estruturado, validação de integridade e restauração em modo mesclagem (`merge`) ou substituição (`overwrite`). |
| **RF09** | **Notificações & Web Push** | ✅ Implementado | Alertas locais via Notification API e Web Push via Service Worker e VAPID keys para abas em background ou aplicativo PWA. |
| **RF10** | **Instalação PWA** | ✅ Implementado | Suporte a Progressive Web App com instalador nativo, ícones de atalho e manifest.json. |
| **RF11** | **Suporte a Temas Visuais** | ✅ Implementado | Troca instantânea entre Dark Mode, Light Mode e alinhamento ao Sistema em paleta oficial monocromática de 10 tons. |
| **RF12** | **Autenticação & Cloud Sync** | 🟡 Parcial | NextAuth.js com Credentials e Google OAuth configurados com sincronização via PostgreSQL (Supabase). |

---

## Requisitos Não Funcionais (RNF)

| ID | Requisito | Status | Descrição |
| :--- | :--- | :--- | :--- |
| **RNF01** | **Arquitetura Local-First** | ✅ Implementado | A aplicação funciona 100% no navegador via `storageAdapter` com persistência reativa e tolerancia a falhas de rede. |
| **RNF02** | **Precisão de Datas & Timezone** | ✅ Implementado | Manipulação de datas civis em formato local `YYYY-MM-DD` sem deslocamentos indevidos por conversão UTC em fusos horários negativos. |
| **RNF03** | **Sincronização Multi-Aba** | ✅ Implementado | Alterações realizadas na Aba A refletem na Aba B em tempo real via eventos `storage` e `devdock-storage-update`. |
| **RNF04** | **Performance & Bundle Otimizado** | ✅ Implementado | Tree-shaking de pacotes ativado em `next.config.mjs`, memoização de cards Kanban com `React.memo` e 0 re-renders desnecessários. |
| **RNF05** | **Tratamento de Erros & Skeletons** | ✅ Implementado | Boundary de erro no Next.js App Router (`error.tsx`, `global-error.tsx`), skeletons de carregamento (`loading.tsx`) e empty states contextuais (`EmptyState`). |
