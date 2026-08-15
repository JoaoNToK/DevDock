# Camada de Dados e Persistência — DevDock

> **Status:** Implementado (Arquitetura Híbrida: Local-First Primary + PostgreSQL/Prisma Sync)

## Visão Geral

O **DevDock** adota uma estratégia de dados **Local-First**, garantindo que o usuário possua total controle e velocidade instantânea no acesso às suas informações, com desacoplamento completo da UI através do [`storageAdapter`](../src/lib/storage/adapter.ts).

---

## 💾 Persistência Local-First (`localStorage`)

Todas as entidades locais são armazenadas utilizando chaves com namespace `devdock:*`:

| Chave | Namespace | Conteúdo |
| :--- | :--- | :--- |
| `devdock:projects_v1` | Projetos & Kanban | Lista de Projetos, Colunas Kanban, Tarefas, Notas, Documentos, Timeline e Metas. |
| `devdock:studies_v2` | Estudos | Matérias, Tópicos com progresso, Anotações, Metas de estudo e Recursos. |
| `devdock:academic_v1` | Faculdade | Dados do Curso, Semestres, Disciplinas com salas/professores e Provas/Trabalhos. |
| `devdock:calendar_v1` | Calendário | Eventos personalizados criados pelo usuário. |
| `devdock:planner_v1` | Planejamento | Atividades do planejamento diário e semanal com horários. |
| `devdock:pomodoro_settings_v1` | Pomodoro | Duração de trabalho, pausas curtas, pausas longas e intervalos. |
| `devdock:pomodoro_sessions_v1` | Pomodoro | Histórico completo de sessões de foco e cronômetro concluídas. |
| `devdock:theme_preference_v1` | Preferências | Preferência de Tema visual (`light`, `dark` ou `system`). |
| `devdock:notification_preferences_v1` | Preferências | Preferências granulares de notificação por módulo. |

---

## 🗄️ Modelo de Banco de Dados PostgreSQL (`prisma/schema.prisma`)

Quando integrado ao Supabase PostgreSQL, os dados do usuário são sincronizados com as tabelas do Prisma ORM:

```prisma
model User {
  id            String             @id @default(cuid())
  name          String?
  email         String?            @unique
  password      String?
  projects      Project[]
  studies       Subject[]
  academic      AcademicCourse[]
  calendar      CalendarEvent[]
  sessions      PomodoroSession[]
  subscriptions PushSubscription[]
}

model Project {
  id                 String        @id @default(cuid())
  userId             String
  name               String
  description        String?
  status             String        @default("active")
  priority           String        @default("medium")
  color              String        @default("#0A0A0A")
  totalFocusMinutes  Int           @default(0)
  tasks              ProjectTask[]
  columns            KanbanColumn[]
}

model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())

  @@unique([userId, endpoint])
}
```
