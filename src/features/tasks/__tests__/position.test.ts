import { describe, expect, it } from "vitest";
import { isVersionConflict, nextPosition, reorder } from "../position";

describe("nextPosition", () => {
  it("retorna 0 para uma lista vazia", () => {
    expect(nextPosition([])).toBe(0);
  });

  it("retorna o maior valor + 1", () => {
    expect(nextPosition([0, 1, 2])).toBe(3);
  });

  it("funciona com posições fora de ordem", () => {
    expect(nextPosition([5, 1, 3])).toBe(6);
  });
});

describe("reorder", () => {
  it("move um item pra frente na lista", () => {
    expect(reorder(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
  });

  it("move um item pra trás na lista", () => {
    expect(reorder(["a", "b", "c", "d"], 3, 0)).toEqual(["d", "a", "b", "c"]);
  });

  it("não muda a lista se origem e destino forem iguais", () => {
    expect(reorder(["a", "b", "c"], 1, 1)).toEqual(["a", "b", "c"]);
  });

  it("não muta a lista original", () => {
    const original = ["a", "b", "c"];
    reorder(original, 0, 2);
    expect(original).toEqual(["a", "b", "c"]);
  });
});

describe("isVersionConflict", () => {
  it("não há conflito quando as versões batem", () => {
    expect(isVersionConflict(3, 3)).toBe(false);
  });

  it("há conflito quando a versão atual avançou", () => {
    expect(isVersionConflict(3, 4)).toBe(true);
  });

  it("há conflito mesmo se a versão esperada for maior (caso anômalo)", () => {
    expect(isVersionConflict(5, 3)).toBe(true);
  });
});
