-- Achado ao escrever os testes de integração: instâncias recentes do Supabase
-- (local e cloud, mesmo template) pararam de expor automaticamente tabelas novas
-- às roles da Data API (anon/authenticated/service_role) sem GRANT explícito —
-- ver comentário sobre `auto_expose_new_tables` em supabase/config.toml, cujo
-- comportamento legado de auto-exposição é removido em 2026-10-30. RLS restringe
-- quais linhas uma role vê; sem GRANT de tabela, a role nem chega a tentar a
-- query (erro "permission denied for table", não um bloqueio de RLS). As
-- migrations 0001-0005 dependiam do comportamento antigo — sem isso, o schema
-- inteiro quebra quando essa flag de compatibilidade for desligada.
grant select, insert, update, delete on
  public.profiles,
  public.boards,
  public.board_members,
  public.columns,
  public.tasks,
  public.subtasks
to authenticated;

grant all on
  public.profiles,
  public.boards,
  public.board_members,
  public.columns,
  public.tasks,
  public.subtasks
to service_role;
