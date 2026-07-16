-- Ao criar um board, o owner vira automaticamente membro dele (role = 'owner').
-- security definer: contorna a RLS de board_members, que exige que quem insere
-- já seja o dono do board — nesse momento a linha do board acabou de ser criada.
create or replace function public.handle_new_board()
returns trigger as $$
begin
  insert into public.board_members (board_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_board_created
  after insert on boards
  for each row execute procedure public.handle_new_board();
