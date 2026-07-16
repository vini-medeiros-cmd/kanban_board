-- Incrementa "version" e atualiza "updated_at" automaticamente a cada UPDATE em tasks.
-- O app nunca escreve version diretamente: só lê a versão atual e a manda de volta
-- no WHERE da atualização (ver src/features/tasks/actions). Se outra edição já tiver
-- incrementado a versão nesse intervalo, a atualização atinge 0 linhas — é o sinal
-- de conflito de edição concorrente.
create or replace function public.bump_task_version()
returns trigger as $$
begin
  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger on_task_updated
  before update on tasks
  for each row execute procedure public.bump_task_version();
