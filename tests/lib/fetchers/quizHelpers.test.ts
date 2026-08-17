import { test, expect, vi, afterEach } from "vitest";
import {
  shuffleArray,
  getAlternatives,
  pickRandomItem,
  cleanTitle,
} from "@/lib/fetchers/quizHelpers";

afterEach(() => {
  vi.restoreAllMocks();
});

/* - Testando shuffleArray: não deve alterar o array original, e o resultado deve conter exatamente os mesmos elementos (só a ordem pode mudar) - */

test("should not mutate the original array", () => {
  const original = [1, 2, 3, 4, 5];
  const copy = [...original];

  shuffleArray(original);

  expect(original).toEqual(copy);
});

test("should return an array with the exact same elements", () => {
  const original = ["a", "b", "c", "d"];

  const result = shuffleArray(original);

  expect(result.sort()).toEqual([...original].sort());
});

/* - Testando pickRandomItem: com Math.random mockado, dá pra prever exatamente qual item será escolhido - */

test("should pick the first item when Math.random returns 0", () => {
  vi.spyOn(Math, "random").mockReturnValue(0);

  const result = pickRandomItem(["a", "b", "c"]);

  expect(result).toBe("a");
});

test("should pick the last item when Math.random returns just under 1", () => {
  vi.spyOn(Math, "random").mockReturnValue(0.999999);

  const result = pickRandomItem(["a", "b", "c"]);

  expect(result).toBe("c");
});

/* - Testando getAlternatives: a resposta certa deve sempre estar presente, sem duplicatas, e o total deve respeitar o número de opções pedido - */

test("should always include the right answer among the alternatives", () => {
  const result = getAlternatives(["a", "b", "c", "d", "e"], 3, "c");

  expect(result).toContain("c");
  expect(result).toHaveLength(4);
});

test("should not duplicate the right answer even if it appears twice in the pool", () => {
  const result = getAlternatives(["a", "c", "c", "d"], 2, "c");

  const occurrences = result.filter((item) => item === "c").length;
  expect(occurrences).toBe(1);
});

test("should throw when the pool does not have enough wrong options to fill the request", () => {
  expect(() => getAlternatives(["a", "b"], 3, "z")).toThrow(
    "Pool insuficiente para gerar as alternativas",
  );
});

test("should not throw when the pool has exactly enough wrong options", () => {
  const result = getAlternatives(["a", "b", "c"], 3, "z");

  expect(result).toHaveLength(4);
  expect(result).toEqual(expect.arrayContaining(["a", "b", "c", "z"]));
});

/* - Testando cleanTitle: remove metadados extras entre parênteses/colchetes - */

test("should remove parenthetical metadata from the title", () => {
  expect(cleanTitle("Bohemian Rhapsody (Remastered 2011)")).toBe("Bohemian Rhapsody");
});

test("should remove bracketed metadata from the title", () => {
  expect(cleanTitle("Song Title [Deluxe Edition]")).toBe("Song Title");
});

test("should trim surrounding whitespace", () => {
  expect(cleanTitle("  Clean Title  ")).toBe("Clean Title");
});

test("should leave a title without metadata unchanged", () => {
  expect(cleanTitle("Just a Regular Title")).toBe("Just a Regular Title");
});
