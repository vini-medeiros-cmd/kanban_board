-- Extensão usada por gen_random_uuid()
create extension if not exists pgcrypto;

-- profiles: 1:1 com auth.users
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

create table boards (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- board_members é a fonte única de verdade para acesso a um board.
-- O owner também vira uma linha aqui (role = 'owner') via trigger na 0003.
create table board_members (
  board_id    uuid not null references boards(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        text not null default 'member' check (role in ('owner', 'member')),
  created_at  timestamptz not null default now(),
  primary key (board_id, user_id)
);
create index idx_board_members_user on board_members(user_id);

create table columns (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid not null references boards(id) on delete cascade,
  name        text not null,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);
create index idx_columns_board on columns(board_id, position);

create table tasks (
  id          uuid primary key default gen_random_uuid(),
  column_id   uuid not null references columns(id) on delete cascade,
  title       text not null,
  description text,
  position    integer not null default 0,
  -- Incrementada a cada update (ver 0004). Usada para detectar edição concorrente:
  -- o client envia a versão que leu; se não bater mais na hora do update, é conflito.
  version     integer not null default 1,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_tasks_column on tasks(column_id, position);

create table subtasks (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null references tasks(id) on delete cascade,
  title         text not null,
  is_completed  boolean not null default false,
  position      integer not null default 0,
  created_at    timestamptz not null default now()
);
create index idx_subtasks_task on subtasks(task_id, position);

-- Helper de RLS: o usuário atual é membro (ou owner) deste board?
create or replace function public.is_board_member(target_board_id uuid)
returns boolean as $$
  select exists (
    select 1 from board_members
    where board_id = target_board_id and user_id = auth.uid()
  );
$$ language sql stable security definer set search_path = public;

alter table profiles       enable row level security;
alter table boards         enable row level security;
alter table board_members  enable row level security;
alter table columns        enable row level security;
alter table tasks          enable row level security;
alter table subtasks       enable row level security;

create policy "user reads own profile" on profiles for select using (auth.uid() = id);
create policy "user updates own profile" on profiles for update using (auth.uid() = id);

create policy "members read their boards" on boards for select using (is_board_member(id));
create policy "authenticated users create boards" on boards for insert with check (auth.uid() = owner_id);
create policy "owner updates board" on boards for update using (owner_id = auth.uid());
create policy "owner deletes board" on boards for delete using (owner_id = auth.uid());

create policy "members read membership of their boards" on board_members for select using (is_board_member(board_id));
create policy "owner or self manages membership" on board_members for insert with check (
  exists (select 1 from boards where id = board_id and owner_id = auth.uid())
  or user_id = auth.uid()
);
create policy "owner removes membership" on board_members for delete using (
  exists (select 1 from boards where id = board_id and owner_id = auth.uid())
);

create policy "members read columns" on columns for select using (is_board_member(board_id));
create policy "members insert columns" on columns for insert with check (is_board_member(board_id));
create policy "members update columns" on columns for update using (is_board_member(board_id));
create policy "members delete columns" on columns for delete using (is_board_member(board_id));

create policy "members read tasks" on tasks for select using (
  exists (select 1 from columns c where c.id = column_id and is_board_member(c.board_id))
);
create policy "members insert tasks" on tasks for insert with check (
  exists (select 1 from columns c where c.id = column_id and is_board_member(c.board_id))
);
create policy "members update tasks" on tasks for update using (
  exists (select 1 from columns c where c.id = column_id and is_board_member(c.board_id))
);
create policy "members delete tasks" on tasks for delete using (
  exists (select 1 from columns c where c.id = column_id and is_board_member(c.board_id))
);

create policy "members read subtasks" on subtasks for select using (
  exists (
    select 1 from tasks t join columns c on c.id = t.column_id
    where t.id = task_id and is_board_member(c.board_id)
  )
);
create policy "members insert subtasks" on subtasks for insert with check (
  exists (
    select 1 from tasks t join columns c on c.id = t.column_id
    where t.id = task_id and is_board_member(c.board_id)
  )
);
create policy "members update subtasks" on subtasks for update using (
  exists (
    select 1 from tasks t join columns c on c.id = t.column_id
    where t.id = task_id and is_board_member(c.board_id)
  )
);
create policy "members delete subtasks" on subtasks for delete using (
  exists (
    select 1 from tasks t join columns c on c.id = t.column_id
    where t.id = task_id and is_board_member(c.board_id)
  )
);
