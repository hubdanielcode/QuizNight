import { test, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/quiz/[category]/route";

/* - Mockando os três fetchers de tema, já que o route handler só orquestra a chamada certa - */

vi.mock("@/lib/fetchers/getGameQuestion", () => ({
  fetchGames: vi.fn(),
  getGameQuestionTheme: vi.fn(),
}));

vi.mock("@/lib/fetchers/getMovieQuestion", () => ({
  fetchMovies: vi.fn(),
  getMovieQuestionTheme: vi.fn(),
}));

vi.mock("@/lib/fetchers/getMusicQuestion", () => ({
  fetchMusics: vi.fn(),
  getMusicQuestionTheme: vi.fn(),
}));

import { fetchGames, getGameQuestionTheme } from "@/lib/fetchers/getGameQuestion";
import { fetchMovies, getMovieQuestionTheme } from "@/lib/fetchers/getMovieQuestion";
import { fetchMusics, getMusicQuestionTheme } from "@/lib/fetchers/getMusicQuestion";

/* - Limpando os mocks entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Testando cada categoria válida - */

test("should return a games question with status 200 when category is 'jogos'", async () => {
  vi.mocked(fetchGames).mockResolvedValue([{ id: 1 }] as never);
  vi.mocked(getGameQuestionTheme).mockResolvedValue({ title: "pergunta de jogo" } as never);

  const response = await GET({} as Request, { params: Promise.resolve({ category: "jogos" }) });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body).toEqual({ title: "pergunta de jogo", category: "jogos" });
});

test("should return a movies question with status 200 when category is 'filmes'", async () => {
  vi.mocked(fetchMovies).mockResolvedValue([{ id: 1 }] as never);
  vi.mocked(getMovieQuestionTheme).mockResolvedValue({ title: "pergunta de filme" } as never);

  const response = await GET({} as Request, { params: Promise.resolve({ category: "filmes" }) });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body).toEqual({ title: "pergunta de filme", category: "filmes" });
});

test("should return a music question with status 200 when category is 'musicas'", async () => {
  vi.mocked(fetchMusics).mockResolvedValue([{ id: 1 }] as never);
  vi.mocked(getMusicQuestionTheme).mockResolvedValue({ title: "pergunta de música" } as never);

  const response = await GET({} as Request, { params: Promise.resolve({ category: "musicas" }) });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body).toEqual({ title: "pergunta de música", category: "musicas" });
});

/* - Testando categoria inválida - */

test("should return status 400 for an invalid category", async () => {
  const response = await GET({} as Request, {
    params: Promise.resolve({ category: "esportes" }),
  });
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(body).toEqual({ error: "invalid category" });
});

/* - Testando falha no fetch - */

test("should return status 500 and log the error when a fetcher throws", async () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(fetchGames).mockRejectedValue(new Error("Falha na API"));

  const response = await GET({} as Request, { params: Promise.resolve({ category: "jogos" }) });
  const body = await response.json();

  expect(response.status).toBe(500);
  expect(body).toEqual({ error: "failed to fetch question" });
  expect(consoleSpy).toHaveBeenCalled();

  consoleSpy.mockRestore();
});
