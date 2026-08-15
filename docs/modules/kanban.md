# Módulo Kanban & Drag & Drop — DevDock

> **Status:** Implementado

## Visão Geral

Quadro Kanban interativo desenvolvido com `@dnd-kit/core` e `@dnd-kit/sortable`. Permite mover tarefas entre colunas, alterar ordem, definir prioridades e disparar sessões de foco diretamente nos cartões.

## Otimizações de Performance

- Componentes de cartão envelopados com `React.memo` e comparação customizada em `SortableKanbanCard.tsx`, isolando os re-renders apenas ao cartão que está sendo arrastado ou modificado.

## Arquivos Principais

- Rota: `src/app/projetos/[id]/kanban/page.tsx`
- Componentes: `src/components/kanban/SortableKanbanCard.tsx`, `KanbanColumnContainer.tsx`
