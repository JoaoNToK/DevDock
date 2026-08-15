# Módulo Faculdade — DevDock

> **Status:** Implementado

## Visão Geral

Gerenciador acadêmico completo para cursos universitários. Permite organizar semestres, disciplinas com salas e professores, notas de avaliações (P1, P2) e cadastro de trabalhos.

## Integração com o Calendário

Provas e trabalhos cadastrados neste módulo geram automaticamente eventos visualizáveis na grade do Calendário unificado.

## Arquivos Principais

- Rota: `src/app/estudos/faculdade/page.tsx`
- Hook: `src/hooks/useAcademic.ts`
- Modais: `src/components/academic/CourseModal.tsx`, `AcademicSubjectModal.tsx`, `AssignmentModal.tsx`
- Tipos: `src/types/academic.ts`
