# Módulo Pomodoro & Cronômetro — DevDock

> **Status:** Implementado

## Visão Geral

O módulo Pomodoro permite alternar entre ciclos de trabalho focado e intervalos de descanso (Pausa Curta e Pausa Longa), além de oferecer um modo Cronômetro para medição direta de tempo.

## Funcionalidades

- **Timer Reativo**: Execução com cálculo preciso de deltas por timestamp (`startedAt`), imune a lentidão do navegador ou abas em segundo plano.
- **Notificações em Background**: Alertas ao término do ciclo via Notification API e Web Push Service Worker.
- **Histórico & Estatísticas**: Gravação automática de sessões concluídas no `storageAdapter`.

## Arquivos Principais

- Rota: `src/app/pomodoro/page.tsx`
- Hook: `src/hooks/usePomodoroTimer.ts`
- Componentes: `src/components/PomodoroTimer.tsx`, `TimerControls.tsx`, `TimerModeSelector.tsx`, `TimerSettings.tsx`
