/**
 * Lógica pura de posicionamento e detecção de conflito — sem I/O, fácil de testar.
 * Usada tanto pelas server actions quanto pela UI de drag-and-drop.
 */

/** Próxima posição ao inserir um item no fim de uma lista (ex: nova tarefa numa coluna). */
export function nextPosition(existingPositions: number[]): number {
  if (existingPositions.length === 0) return 0;
  return Math.max(...existingPositions) + 1;
}

/**
 * Recalcula as posições (0, 1, 2, ...) de uma lista de ids após mover um item
 * de `fromIndex` para `toIndex` — usado pelo drag-and-drop dentro da mesma coluna
 * e para a coluna de destino ao mover entre colunas.
 */
export function reorder<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...list];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

/**
 * Uma edição é considerada em conflito se a versão que o client tinha em mãos
 * (lida antes de editar) não bate mais com a versão atual no banco — ou seja,
 * alguém mais salvou uma mudança nesse meio-tempo.
 */
export function isVersionConflict(expectedVersion: number, currentVersion: number): boolean {
  return expectedVersion !== currentVersion;
}
