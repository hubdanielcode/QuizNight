import { test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchMovies,
  fetchMovieDirector,
  getMovieQuestionTheme,
  getMovieRating,
  getMovieDirectorName,
  getMovieName,
  getMovieReleaseYear,
} from "@/lib/fetchers/getMovieQuestion";
import { pickRandomItem, getAlternatives, shuffleArray } from "@/lib/fetchers/quizHelpers";
import type { MovieProps } from "@/types/movies";

/* - Mockando os helpers compartilhados, pra testar só a lógica específica de cada pergunta sobre filmes, sem depender da aleatoriedade real - */

vi.mock("@/lib/fetchers/quizHelpers", () => ({
  pickRandomItem: vi.fn(),
  getAlternatives: vi.fn(),
  cleanTitle: vi.fn((title: string) => title),
  shuffleArray: vi.fn((list: unknown[]) => list),
}));

const normalGetAlternatives = (list: unknown[], _options: number, rightAnswer: unknown) => [
  rightAnswer,
  ...list.filter((item) => item !== rightAnswer).slice(0, 3),
];

const movies: MovieProps[] = [
  {
    id: 1,
    title: "Interestelar",
    release_date: "2014-11-06",
    vote_average: 8.6,
    backdrop_path: "/a.jpg",
  },

  {
    id: 2,
    title: "Duna",
    release_date: "2021-10-21",
    vote_average: 8.0,
    backdrop_path: "/b.jpg",
  },

  {
    id: 3,
    title: "Oppenheimer",
    release_date: "2023-07-19",
    vote_average: 8.3,
    backdrop_path: "/c.jpg",
  },

  {
    id: 4,
    title: "Coringa",
    release_date: "2019-10-03",
    vote_average: 8.4,
    backdrop_path: "/d.jpg",
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(pickRandomItem).mockImplementation((list: unknown[]) => list[0]);
  vi.mocked(getAlternatives).mockImplementation(normalGetAlternatives);
  vi.mocked(shuffleArray).mockImplementation((list: unknown[]) => list);
  vi.stubGlobal("fetch", vi.fn());
  vi.stubEnv("TMDB_API_KEY", "test-key");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

/* - Testando a busca da lista de filmes (3 páginas combinadas) - */

test("should fetch and merge 3 pages of movies", async () => {
  const buildMovie = (id: number) => ({
    id,
    title: `Filme ${id}`,
    release_date: "2020-01-01",
    vote_average: 7.5,
    backdrop_path: "/a.jpg",
  });

  vi.mocked(fetch).mockImplementation(
    async (url) =>
      ({
        ok: true,
        json: async () => ({
          results: [buildMovie((url as string).includes("page=2") ? 2 : 1)],
        }),
      }) as Response,
  );

  const result = await fetchMovies();

  expect(fetch).toHaveBeenCalledTimes(3);
  expect(result).toHaveLength(3);
});

test("should throw when fetching a page of movies fails", async () => {
  vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

  await expect(fetchMovies()).rejects.toThrow("Erro ao buscar a lista de filmes");
});

test("should throw when a page of movies has an unexpected shape", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ results: [{ id: 1 }] }),
  } as Response);

  await expect(fetchMovies()).rejects.toThrow("Formato inesperado na resposta da lista de filmes");
});

/* - Testando a busca do diretor do filme - */

test("should fetch the movie's director name", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({
      crew: [
        { job: "Producer", name: "Fulano" },
        { job: "Director", name: "Christopher Nolan" },
      ],
    }),
  } as Response);

  const result = await fetchMovieDirector(1);

  expect(result).toBe("Christopher Nolan");
});

test("should throw when fetching the movie's director fails", async () => {
  vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

  await expect(fetchMovieDirector(1)).rejects.toThrow(
    "Erro ao buscar o nome do diretor do filme sorteado",
  );
});

/* - Testando a pergunta sobre o filme com maior nota - */

test("should pick the highest rated movie as the right answer", () => {
  const result = getMovieRating(movies);

  expect(result.rightAnswer).toBe("Interestelar");
});

/* - Testando a pergunta sobre o diretor de cada filme da lista - */

test("should use the director of the selected movie as the right answer", async () => {
  vi.mocked(fetch).mockImplementation(
    async (url) =>
      ({
        ok: true,
        json: async () => ({
          crew: [
            { job: "Director", name: (url as string).includes("/1/") ? "Diretor A" : "Diretor B" },
          ],
        }),
      }) as Response,
  );

  const result = await getMovieDirectorName(movies, movies[0]);

  expect(result.rightAnswer).toBe("Diretor A");
});

/* - Testando a pergunta sobre o nome do filme - */

test("should use the selected movie's title as the right answer", () => {
  const result = getMovieName(movies, movies[0]);

  expect(result.rightAnswer).toBe("Interestelar");
});

/* - Testando a pergunta sobre o ano de lançamento - */

test("should use the release year of the selected movie as the right answer", () => {
  const result = getMovieReleaseYear(movies, movies[0]);

  expect(result.rightAnswer).toBe(2014);
});

/* - Testando o tema da pergunta ponta a ponta, cobrindo os 4 tipos possíveis - */

test("should build the movie name question", async () => {
  vi.mocked(pickRandomItem).mockReturnValueOnce("aboutMovieName").mockReturnValueOnce(movies[0]);
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ crew: [{ job: "Director", name: "Christopher Nolan" }] }),
  } as Response);

  const result = await getMovieQuestionTheme(movies);

  expect(result.title).toContain("dirigido por Christopher Nolan");
  expect(result.questionType).toBe("aboutMovieName");
});

test("should build the release year question", async () => {
  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutMovieReleaseYear")
    .mockReturnValueOnce(movies[0]);
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ crew: [{ job: "Director", name: "Christopher Nolan" }] }),
  } as Response);

  const result = await getMovieQuestionTheme(movies);

  expect(result.title).toBe("Em qual ano foi lançado o filme Interestelar?");
  expect(result.questionType).toBe("aboutMovieReleaseYear");
});

test("should build the rating question", async () => {
  vi.mocked(pickRandomItem).mockReturnValueOnce("aboutMovieRating").mockReturnValueOnce(movies[0]);
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ crew: [{ job: "Director", name: "Christopher Nolan" }] }),
  } as Response);

  const result = await getMovieQuestionTheme(movies);

  expect(result.title).toBe("Dentre os filmes abaixo, qual teve a melhor avaliação?");
  expect(result.questionType).toBe("aboutMovieRating");
});

test("should build the director question as the default theme", async () => {
  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutMovieDirectorName")
    .mockReturnValueOnce(movies[0]);
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ crew: [{ job: "Director", name: "Christopher Nolan" }] }),
  } as Response);

  const result = await getMovieQuestionTheme(movies);

  expect(result.title).toBe("Quem foi o diretor responsável pelo filme Interestelar?");
  expect(result.questionType).toBe("aboutMovieDirectorName");
});

/* - Testando o retry: um erro dentro do try/catch deve fazer a função tentar de novo, sorteando um novo tipo/filme - */

test("should retry building the question when assembling the alternatives fails", async () => {
  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutMovieReleaseYear")
    .mockReturnValueOnce(movies[0])
    .mockReturnValueOnce("aboutMovieReleaseYear")
    .mockReturnValueOnce(movies[1]);

  vi.mocked(getAlternatives)
    .mockImplementationOnce(normalGetAlternatives)
    .mockImplementationOnce(() => {
      throw new Error("Falha ao montar alternativas");
    });

  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ crew: [{ job: "Director", name: "Christopher Nolan" }] }),
  } as Response);

  const result = await getMovieQuestionTheme(movies);

  expect(result.title).toBe("Em qual ano foi lançado o filme Duna?");
  expect(pickRandomItem).toHaveBeenCalledTimes(4);
});

/* - getMovieReleaseYear(movies, selectedMovie) roda dentro do try, então, se o pool de anos disponíveis for pequeno demais e getAlternatives lançar erro,
     esse erro deve ser capturado e disparar um novo sorteio (retry) - e não escapar da função sem chance de tentar de novo - */

test("should retry when the release year calculation itself fails", async () => {
  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutMovieRating")
    .mockReturnValueOnce(movies[0])
    .mockReturnValueOnce("aboutMovieRating")
    .mockReturnValueOnce(movies[1]);

  vi.mocked(getAlternatives)
    .mockImplementationOnce(() => {
      throw new Error("Pool insuficiente para gerar as alternativas");
    })
    .mockImplementationOnce(normalGetAlternatives);

  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ crew: [{ job: "Director", name: "Christopher Nolan" }] }),
  } as Response);

  const result = await getMovieQuestionTheme(movies);

  expect(pickRandomItem).toHaveBeenCalledTimes(4);
  expect(result.title).toBe("Dentre os filmes abaixo, qual teve a melhor avaliação?");
});
