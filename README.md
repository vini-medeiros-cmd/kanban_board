# Kanban Board

App de gerenciamento de tarefas em quadros Kanban — múltiplos boards, colunas, tarefas com subtarefas, drag-and-drop e colaboração em tempo real entre quem estiver no mesmo board.

Baseado no design do [Frontend Mentor - Kanban Task Management](https://www.frontendmentor.io/challenges/kanban-task-management-web-app-wgQLt-HlbB) (o layout visual ainda precisa ser aplicado — ver "Próximos passos").

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth), rodando localmente via Docker durante o desenvolvimento
- [@dnd-kit](https://dndkit.com/) para drag-and-drop (substitui o `react-beautiful-dnd` sugerido originalmente — descontinuado e sem suporte a React 18+/Strict Mode)
- Supabase Realtime (Postgres changes via WebSocket) para colaboração ao vivo
- Vitest para testes unitários

## Diferenciais implementados

- **Múltiplos boards por usuário**, com controle de acesso por `board_members` (RLS multi-tenant real, não só filtro na UI)
- **Persistência de posição**: colunas e tarefas guardam `position` no banco, recalculada a cada drag-and-drop
- **Subtarefas** por tarefa, com progresso (`x/y concluídas`)
- **Colaboração em tempo real**: mudanças em tarefas de um board propagam via Supabase Realtime para todos conectados naquele board
- **Conflito de edição**: cada tarefa tem uma coluna `version`, incrementada automaticamente por trigger a cada `UPDATE`. Editar um título envia a versão lida junto — se alguém mais já tiver salvo uma mudança, o update atinge 0 linhas e a UI avisa o conflito em vez de sobrescrever silenciosamente

## Setup local

1. `npm install`
2. Copie `.env.local.example` para `.env.local`.
3. Suba o Supabase local (requer Docker rodando): `npx supabase start`. Copie a `anon key`, `service_role key` e a URL da API impressas no terminal para o `.env.local`.
4. Aplique as migrations: `npx supabase db reset` (ou `npx supabase migration up`).
5. Gere os tipos do banco: `npm run db:types` (os tipos em `src/lib/supabase/database.types.ts` foram escritos manualmente a partir das migrations — rodar isso confirma que batem com o schema real).
6. `npm run dev` e acesse `http://localhost:3000`.

## Testes

`npm test` roda os testes unitários da lógica de posicionamento e detecção de conflito (`src/features/tasks/position.ts`) — a parte testável sem precisar de banco.

## Status atual

Fluxo funcional de ponta a ponta: login/cadastro → criar board → criar colunas → criar tarefas → arrastar entre colunas → editar tarefa com aviso de conflito → subtarefas com progresso → tudo sincronizado em tempo real entre abas/usuários.

## Próximos passos

- [ ] Aplicar o design do Frontend Mentor (atualmente só tem uma UI funcional, sem o visual do desafio)
- [ ] Convite de membros para um board (hoje só o owner tem acesso — a tabela `board_members` já suporta múltiplos membros, falta a UI de convite)
- [ ] Testes de integração para as server actions (hoje só a lógica pura tem testes)
- [ ] Deploy (Vercel + Supabase Cloud)
