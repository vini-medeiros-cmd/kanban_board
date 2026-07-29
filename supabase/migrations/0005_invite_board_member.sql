-- Convite de membro por e-mail. Não dá pra fazer isso só com um insert direto em
-- board_members pelo client: a RLS de profiles restringe leitura ao próprio
-- usuário, então não há como o client resolver "e-mail -> user_id" de outra
-- pessoa. Uma função security definer resolve isso sem precisar abrir a RLS de
-- profiles pra qualquer membro autenticado (o que vazaria e-mails do sistema
-- inteiro). A checagem de "só o owner convida" fica dentro da função, replicando
-- a mesma regra da policy de insert em board_members.
create or replace function public.invite_board_member(target_board_id uuid, member_email text)
returns void as $$
declare
  target_user_id uuid;
begin
  if not exists (
    select 1 from boards where id = target_board_id and owner_id = auth.uid()
  ) then
    raise exception 'only the board owner can invite members';
  end if;

  select id into target_user_id from profiles where email = member_email limit 1;

  if target_user_id is null then
    raise exception 'no user found with this email';
  end if;

  insert into board_members (board_id, user_id, role)
  values (target_board_id, target_user_id, 'member')
  on conflict (board_id, user_id) do nothing;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.invite_board_member(uuid, text) to authenticated;
