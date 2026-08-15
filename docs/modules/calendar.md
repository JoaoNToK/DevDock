# Módulo Calendário — DevDock

> **Status:** Implementado

## Visão Geral

Calendário unificado que consolida eventos criados pelo usuário com os prazos de entregas de tarefas de projetos e avaliações/provas do módulo de Faculdade.

## Fusos Horários Locais

Utiliza estritamente datas civis em formato local (`YYYY-MM-DD`), garantindo consistência visual sem desvios de timezone UTC.

## Arquivos Principais

- Rota: `src/app/calendario/page.tsx`
- Hook: `src/hooks/useCalendarEvents.ts`
- Utilitário: `src/lib/date/index.ts`
- Tipos: `src/types/calendar.ts`
