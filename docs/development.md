# Guia de Desenvolvimento — DevDock

> **Status:** Atualizado

## Scripts Disponíveis

Conforme o [`package.json`](../package.json):

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Next.js em `http://localhost:3000`. |
| `npm run build` | Compila o projeto e gera a build estática/dinâmica de produção. |
| `npm start` | Inicia o servidor de produção com a build gerada. |
| `npm run lint` | Executa a verificação do ESLint no código do Next.js. |
| `npm test` | Executa a suíte completa de testes automatizados (`npx tsx tests/run_all_tests.ts`). |
| `npx tsc --noEmit` | Executa a verificação estática de tipos do TypeScript em todo o projeto. |

---

## Convenções de Nomenclatura

- **Componentes React**: PascalCase em `src/components/` (ex: `SortableKanbanCard.tsx`, `EmptyState.tsx`).
- **Custom Hooks**: camelCase em `src/hooks/` iniciando com `use` (ex: `useProjects.ts`, `usePomodoroTimer.ts`).
- **Storage Keys**: Namespaces estritos `devdock:*` em [`src/lib/storage/keys.ts`](../src/lib/storage/keys.ts).
- **Tipos & Interfaces**: PascalCase em `src/types/` (ex: `Project`, `ProjectTask`, `AcademicCourse`).

---

## Boas Práticas de Persistência

Ao criar novas funcionalidades que exijam armazenamento de dados no navegador:
1. Registre a chave em `STORAGE_KEYS` no arquivo `src/lib/storage/keys.ts`.
2. Utilize exclusivamente o `storageAdapter.get` e `storageAdapter.set`.
3. Inscreva o componente no `useStorageSync` para garantir reatividade síncrona entre abas.
