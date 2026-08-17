import { test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchGames,
  fetchGamePublisher,
  getGameQuestionTheme,
  getGameAverageRating,
  getAvailablePlatforms,
  getGameName,
  getGameReleaseYear,
} from "@/lib/fetchers/getGameQuestion";
import { pickRandomItem, getAlternatives } from "@/lib/fetchers/quizHelpers";
import type { GameProps } from "@/types/games";

/* - Mockando os helpers compartilhados, pra testar só a lógica específica de cada pergunta sobre jogos, sem depender da aleatoriedade real - */

vi.mock("@/lib/fetchers/quizHelpers", () => ({
  pickRandomItem: vi.fn(),
  getAlternatives: vi.fn(),
  cleanTitle: vi.fn((title: string) => title),
  shuffleArray: vi.fn((list: unknown[]) => list),
}));

/* - Implementação "normal" de getAlternatives usada como comportamento padrão - devolve a resposta certa junto de até 3 respostas erradas do pool - */

const normalGetAlternatives = (list: unknown[], _options: number, rightAnswer: unknown) => [
  rightAnswer,
  ...list.filter((item) => item !== rightAnswer).slice(0, 3),
];

const games: GameProps[] = [
  {
    id: 1,
    name: "The Witcher 3",
    released: "2015-05-19",
    metacritic: 92,
    platforms: [{ platform: { name: "PC" } }, { platform: { name: "PlayStation 4" } }],
    genre: [{ name: "RPG" }],
  },

  {
    id: 2,
    name: "Celeste",
    released: "2018-01-25",
    metacritic: 88,
    platforms: [{ platform: { name: "Nintendo Switch" } }],
    genre: [{ name: "Platformer" }],
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(pickRandomItem).mockImplementation((list: unknown[]) => list[0]);
  vi.mocked(getAlternatives).mockImplementation(normalGetAlternatives);
  vi.stubGlobal("fetch", vi.fn());
  vi.stubEnv("RAWG_API_KEY", "testKey");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

/* - Testando a busca da lista de jogos - */

test("should fetch the games list using the RAWG_API_KEY", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ results: games }),
  } as Response);

  const result = await fetchGames();

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("key=testKey"),
    expect.objectContaining({ cache: "no-store" }),
  );
  expect(result).toEqual(games);
});

test("should throw when fetching the games list fails", async () => {
  vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

  await expect(fetchGames()).rejects.toThrow("Erro ao buscar lista de jogos");
});

/* - Testando a busca da desenvolvedora do jogo - */

test("should fetch the game publisher's name", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ publishers: [{ name: "CD Projekt Red" }] }),
  } as Response);

  const result = await fetchGamePublisher(1);

  expect(result).toBe("CD Projekt Red");
});

test("should throw when fetching the game publisher fails", async () => {
  vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

  await expect(fetchGamePublisher(1)).rejects.toThrow("Erro ao buscar desenvolvedora do jogo");
});

/* - Testando o cálculo do intervalo de nota do Metacritic - */

test("should compute the metacritic rating interval for the selected game", () => {
  const result = getGameAverageRating(games, games[0]);

  expect(result.rightAnswer).toBe("90 - 95");
});

test("should clamp the interval to a minimum floor of 50 for low ratings", () => {
  const lowRatedGame = { ...games[0], metacritic: 12 };

  const result = getGameAverageRating([lowRatedGame], lowRatedGame);

  expect(result.rightAnswer).toBe("50 - 55");
});

test("should keep a 100 rating as a single-point interval", () => {
  const perfectGame = { ...games[0], metacritic: 100 };

  const result = getGameAverageRating([perfectGame], perfectGame);

  expect(result.rightAnswer).toBe("100 - 100");
});

/* - Testando a escolha da plataforma disponível como resposta certa - */

test("should pick the right answer only from platforms where the game is available", () => {
  const result = getAvailablePlatforms(games[0]);

  expect(["PC", "PlayStation 4"]).toContain(result.rightAnswer);
});

test("should not offer the right answer's platform among the wrong options", () => {
  const result = getAvailablePlatforms(games[0]);

  expect(result.possibleAnswers.filter((answer) => answer === result.rightAnswer)).toHaveLength(1);
});

/* - Testando a pergunta sobre o nome do jogo - */

test("should use the selected game's name as the right answer", () => {
  const result = getGameName(games, games[0]);

  expect(result.rightAnswer).toBe("The Witcher 3");
});

/* - Testando a pergunta sobre o ano de lançamento - */

test("should use the release year of the selected game as the right answer", () => {
  const result = getGameReleaseYear(games, games[0]);

  expect(result.rightAnswer).toBe(2015);
});

/* - Testando o tema da pergunta ponta a ponta, cobrindo os 4 tipos possíveis - */

test("should build the average rating question", async () => {
  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutGameAverageRating")
    .mockReturnValueOnce(games[0]);
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ publishers: [{ name: "CD Projekt Red" }] }),
  } as Response);

  const result = await getGameQuestionTheme(games);

  expect(result.title).toContain("Metacritic");
  expect(result.title).toContain("The Witcher 3");
  expect(result.questionType).toBe("aboutGameAverageRating");
});

test("should build the available platforms question", async () => {
  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutGameAvailablePlatforms")
    .mockReturnValueOnce(games[0]);
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ publishers: [{ name: "CD Projekt Red" }] }),
  } as Response);

  const result = await getGameQuestionTheme(games);

  expect(result.title).toContain("Publicado pela CD Projekt Red");
  expect(result.questionType).toBe("aboutGameAvailablePlatforms");
});

test("should build the game name question", async () => {
  vi.mocked(pickRandomItem).mockReturnValueOnce("aboutGameName").mockReturnValueOnce(games[0]);
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ publishers: [{ name: "CD Projekt Red" }] }),
  } as Response);

  const result = await getGameQuestionTheme(games);

  expect(result.title).toContain("lançado no ano de 2015");
  expect(result.questionType).toBe("aboutGameName");
});

test("should build the release year question as the default theme", async () => {
  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutGameReleaseYear")
    .mockReturnValueOnce(games[0]);
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ publishers: [{ name: "CD Projekt Red" }] }),
  } as Response);

  const result = await getGameQuestionTheme(games);

  expect(result.title).toBe("Em qual ano foi lançado o jogo The Witcher 3?");
  expect(result.questionType).toBe("aboutGameReleaseYear");
});

/* - Testando o caso em que a busca da desenvolvedora falha uma vez: como agora ela roda dentro
     do try, deve disparar o retry normalmente e se recuperar quando a segunda tentativa não
     precisar mais do publisher - */

test("should retry and recover when fetching the publisher fails once", async () => {
  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutGameName")
    .mockReturnValueOnce(games[0])
    .mockReturnValueOnce("aboutGameReleaseYear")
    .mockReturnValueOnce(games[1]);

  vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);

  const result = await getGameQuestionTheme(games);

  expect(result.title).toBe("Em qual ano foi lançado o jogo Celeste?");
  expect(pickRandomItem).toHaveBeenCalledTimes(4);
});

/* - Testando o caso em que a busca da desenvolvedora falha sempre: o retry deve parar depois
     de um número máximo de tentativas, em vez de entrar num loop infinito - */

test("should give up and reject after exhausting the retry attempts", async () => {
  vi.mocked(pickRandomItem).mockReturnValue("aboutGameName");
  vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

  await expect(getGameQuestionTheme(games)).rejects.toThrow(
    "Erro ao buscar desenvolvedora do jogo",
  );
});

/* - Testando o retry: um erro dentro do try (ao montar as alternativas) deve fazer a função tentar de novo, sorteando um novo tipo/jogo - */

test("should retry building the question when assembling the alternatives fails", async () => {
  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutGameName")
    .mockReturnValueOnce(games[0])
    .mockReturnValueOnce("aboutGameName")
    .mockReturnValueOnce(games[1]);

  vi.mocked(getAlternatives)
    .mockImplementationOnce(normalGetAlternatives)
    .mockImplementationOnce(() => {
      throw new Error("Falha ao montar alternativas");
    });

  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ publishers: [{ name: "Nintendo" }] }),
  } as Response);

  const result = await getGameQuestionTheme(games);

  expect(result.selectedGame).toEqual(games[1]);
  expect(pickRandomItem).toHaveBeenCalledTimes(4);
  expect(fetch).toHaveBeenCalledTimes(1);
});

/* - getGameReleaseYear(games, selectedGame) roda dentro do try, então, se o pool de anos disponíveis for pequeno demais e getAlternatives lançar erro, esse
     erro deve ser capturado e disparar um novo sorteio (retry) - e não escapar da função sem chance de tentar de novo - */

test("should retry when the release year calculation itself fails", async () => {
  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutGameAvailablePlatforms")
    .mockReturnValueOnce(games[0])
    .mockReturnValueOnce("aboutGameAvailablePlatforms")
    .mockReturnValueOnce(games[1]);

  vi.mocked(getAlternatives)
    .mockImplementationOnce(() => {
      throw new Error("Pool insuficiente para gerar as alternativas");
    })
    .mockImplementationOnce(normalGetAlternatives)
    .mockImplementationOnce(normalGetAlternatives);

  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ publishers: [{ name: "Nintendo" }] }),
  } as Response);

  const result = await getGameQuestionTheme(games);

  expect(result.selectedGame).toEqual(games[1]);
  expect(pickRandomItem).toHaveBeenCalledTimes(5);
  expect(fetch).toHaveBeenCalledTimes(1);
});
