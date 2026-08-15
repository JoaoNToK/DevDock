# Suíte de Testes Automatizados — DevDock

> **Status:** Implementado (16/16 Testes Aprovados)

## Estrutura dos Testes

O DevDock possui uma suíte completa de testes automatizados determinísticos localizada em [`tests/`](../tests/):

```text
tests/
├── setup_mock_storage.ts                      # Isolated mock storage setup helper
├── unit/
│   ├── date_timezone.test.ts                  # Testes de formato civil e fusos horários
│   ├── pomodoro.test.ts                       # Testes de timer, background e máquina de estados
│   └── projects.test.ts                       # Testes de Projetos, Kanban e tarefas
├── integration/
│   └── college_calendar_integration.test.ts   # Teste de integração Faculdade -> Calendário
└── run_all_tests.ts                           # Executor mestre da suíte de testes
```

---

## Como Executar a Suíte de Testes

Para rodar todos os testes automatizados da aplicação:

```bash
npm test
```

---

## Módulos Cobertos

1. **Date & Timezone Tests (6/6)**: Valida `formatYMD`, `parseYMD`, `formatDateBR`, `isSameLocalDay` e virada de dia às `00:00:00` e `23:59:59`.
2. **Pomodoro Timer & Background Tests (4/4)**: Valida configurações padrão, cálculo de tempo em background por timestamp, transição de ciclos e restauração do histórico.
3. **Projects, Kanban & Tasks Tests (4/4)**: Valida criação de projetos, movimentação de colunas em Kanban, reordenamento e conclusão de tarefas.
4. **Faculdade $\rightarrow$ Calendar Integration Tests (2/2)**: Valida a leitura de trabalhos/provas da faculdade e sua renderização correta no Calendário unificado.
