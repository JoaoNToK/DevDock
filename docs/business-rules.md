# Regras de Negócio — DevDock

> **Status:** Implementado

## 1. Regras do Pomodoro & Cronômetro

- **Durações Padrão**: Foco (25 minutos), Pausa Curta (5 minutos), Pausa Longa (15 minutos) a cada 4 ciclos de foco concluídos.
- **Execução em Background**: O timer calcula o tempo decorrido utilizando deltas de timestamp (`startedAt`), garantindo precisão absoluta mesmo quando a aba é minimizada, colocada em segundo plano ou o dispositivo entra em repouso.
- **Controle de Instância**: Chamadas repetidas a `Start` não criam múltiplos intervalos concorrentes.
- **Transição de Fases**: Ao concluir ou acionar `Skip`, o timer alterna de modo preservando o histórico de contagem.

---

## 2. Regras de Projetos & Kanban

- **Prioridades**: `urgent` (vermelho), `high` (âmbar), `medium` / `normal` (neutro).
- **Drag & Drop Reativo**: O reordenamento de cartões e a movimentação entre colunas (`col-todo` $\rightarrow$ `col-doing` $\rightarrow$ `col-done`) são refletidos imediatamente com suporte a atalho para iniciar sessão Pomodoro diretamente na tarefa.
- **Cálculo de Progresso**: A porcentagem de progresso do projeto é calculada dinamicamente com base nas tarefas posicionadas na coluna "Concluído" ou marcadas com `completedAt`.

---

## 3. Regras de Faculdade & Calendário (Integração)

- **Fusos Horários Locais (Civil Dates)**: Todas as datas de entregas, trabalhos e provas utilizam a representação de data civil local `YYYY-MM-DD`. É proibido o uso de `toISOString()` em datas civis para evitar o problema de virada de dia próximo da meia-noite (`-1` dia em timezones ocidentais como UTC-3).
- **Integração Automática com o Calendário**: Avaliações e trabalhos cadastrados no módulo de Faculdade são lidos automaticamente pelo hook `useCalendarEvents` e renderizados na grade de eventos do Calendário sob as categorias `Prova` e `Faculdade`.
