-- Achado testando "criar board" de ponta a ponta: `INSERT INTO boards ... RETURNING`
-- (usado em create-board.ts) aplica a policy de SELECT sobre a linha retornada,
-- não só o WITH CHECK do insert. Como a policy de SELECT dependia só de
-- is_board_member(id), e a linha do owner em board_members só existe depois do
-- trigger on_board_created (AFTER INSERT, 0003), o RETURNING falhava com "new row
-- violates row-level security policy for table boards" mesmo com owner_id correto
-- — um "ovo e galinha" entre o insert e o trigger que o torna visível. Adicionar
-- owner_id = auth.uid() como alternativa resolve, e é semanticamente correto de
-- qualquer forma: o owner sempre pode ler o próprio board.
drop policy "members read their boards" on boards;

create policy "members read their boards" on boards for select using (
  is_board_member(id) or owner_id = auth.uid()
);
