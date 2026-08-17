import { test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchMusics,
  fetchArtistsTopMusics,
  getMusicQuestionTheme,
  getArtistName,
  getAlbumTitle,
  getMusicTitle,
  getArtistsTopMusics,
} from "@/lib/fetchers/getMusicQuestion";
import { pickRandomItem, getAlternatives, shuffleArray } from "@/lib/fetchers/quizHelpers";
import type { MusicProps } from "@/types/musics";

/* - Mockando os helpers compartilhados, pra testar só a lógica específica de cada pergunta sobre músicas, sem depender da aleatoriedade real - */

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

const buildMusic = (overrides: Partial<MusicProps> = {}): MusicProps => ({
  id: 1,
  title: "Faixa 1",
  rank: 100,
  artist: { id: 10, name: "Artista X", picture: "artist.jpg" },
  album: { id: 20, cover: "album.jpg", title: "Álbum X" },
  ...overrides,
});

const musics: MusicProps[] = [
  buildMusic({ id: 1, title: "Faixa 1" }),
  buildMusic({ id: 2, title: "Faixa 2", artist: { id: 11, name: "Artista Y", picture: "y.jpg" } }),
];

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(pickRandomItem).mockImplementation((list: unknown[]) => list[0]);
  vi.mocked(getAlternatives).mockImplementation(normalGetAlternatives);
  vi.mocked(shuffleArray).mockImplementation((list: unknown[]) => list);
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/* - Testando a busca do chart de músicas mais tocadas - */

test("should fetch the top tracks chart", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ data: musics }),
  } as Response);

  const result = await fetchMusics();

  expect(fetch).toHaveBeenCalledWith(
    "https://api.deezer.com/chart/0/tracks",
    expect.objectContaining({ cache: "no-store" }),
  );

  expect(result).toEqual(musics);
});

test("should throw when fetching the chart fails", async () => {
  vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

  await expect(fetchMusics()).rejects.toThrow("Erro ao buscar a lista de músicas");
});

/* - Testando a busca das músicas mais tocadas de um artista - */

test("should fetch the artist's top tracks", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ data: musics }),
  } as Response);

  const result = await fetchArtistsTopMusics(10);

  expect(fetch).toHaveBeenCalledWith("https://api.deezer.com/artist/10/top", {
    cache: "no-store",
  });

  expect(result).toEqual(musics);
});

test("should throw when fetching the artist's top tracks fails", async () => {
  vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

  await expect(fetchArtistsTopMusics(10)).rejects.toThrow(
    "Erro ao buscar as músicas desse artista",
  );
});

/* - Testando a pergunta sobre o nome do artista - */

test("should use the selected music's artist name as the right answer", () => {
  const result = getArtistName(musics, musics[0]);

  expect(result.rightAnswer).toBe("Artista X");
});

/* - Testando a pergunta sobre o título do álbum - */

test("should use the selected music's album title as the right answer", () => {
  const result = getAlbumTitle(musics, musics[0]);

  expect(result.rightAnswer).toBe("Álbum X");
});

/* - Testando a pergunta "qual música não pertence ao álbum" - */

test("should pick the right answer from a track outside the selected album", async () => {
  const albumTracks = [
    { title: "Faixa do Álbum A" },
    { title: "Faixa do Álbum B" },
    { title: "Faixa do Álbum C" },
  ];
  const outsideTracks = [
    buildMusic({ title: "Faixa de Fora", album: { id: 999, cover: "", title: "Outro Álbum" } }),
  ];

  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ data: albumTracks }),
  } as Response);

  vi.mocked(pickRandomItem).mockReturnValue("Faixa de Fora");

  /* - fetchArtistsTopMusics é chamado dentro de getMusicTitle via Promise.all, então usamos o mesmo fetch mockado - mas ele busca do artista, não do álbum, então
   simulamos as duas respostas condicionalmente pela URL - */

  vi.mocked(fetch).mockImplementation(
    async (url) =>
      ({
        ok: true,
        json: async () =>
          (url as string).includes("/album/") ? { data: albumTracks } : { data: outsideTracks },
      }) as Response,
  );

  const result = await getMusicTitle(10, musics[0]);

  expect(result.rightAnswer).toBe("Faixa de Fora");
});

test("should throw when there is not enough of a pool to build the question", async () => {
  const albumTracks = [{ title: "Única Faixa" }];
  const artistTopTracks = [
    buildMusic({ title: "Única Faixa", album: { id: 20, cover: "", title: "Álbum X" } }),
  ];

  vi.mocked(fetch).mockImplementation(
    async (url) =>
      ({
        ok: true,
        json: async () =>
          (url as string).includes("/album/") ? { data: albumTracks } : { data: artistTopTracks },
      }) as Response,
  );

  await expect(getMusicTitle(10, musics[0])).rejects.toThrow(
    "Pool insuficiente de músicas para gerar a pergunta",
  );
});

/* - Testando a pergunta sobre a música mais escutada do artista - */

test("should pick the track with the highest rank as the right answer", async () => {
  const topMusics = [
    buildMusic({ title: "Faixa Baixo Rank", rank: 10 }),
    buildMusic({ title: "Faixa Alto Rank", rank: 500 }),
    buildMusic({ title: "Faixa Médio Rank", rank: 100 }),
  ];

  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ data: topMusics }),
  } as Response);

  const result = await getArtistsTopMusics(10);

  expect(result.rightAnswer).toBe("Faixa Alto Rank");
});

test("should throw when no track has a valid rank", async () => {
  const topMusics = [buildMusic({ rank: 0 })];

  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ data: topMusics }),
  } as Response);

  await expect(getArtistsTopMusics(10)).rejects.toThrow(
    "Não foi possível determinar a música mais escutada",
  );
});

/* - Testando o tema da pergunta ponta a ponta, cobrindo os 4 tipos possíveis - */

test("should build the artist name question", async () => {
  vi.mocked(pickRandomItem).mockReturnValueOnce("aboutArtistName").mockReturnValueOnce(musics[0]);

  const result = await getMusicQuestionTheme(musics);

  expect(result.title).toBe("Qual o nome desse(a) artista?");
  expect(result.imageUrl).toBe("artist.jpg");
  expect(result.questionType).toBe("aboutArtistName");
});

test("should build the album title question", async () => {
  vi.mocked(pickRandomItem).mockReturnValueOnce("aboutAlbumTitle").mockReturnValueOnce(musics[0]);

  const result = await getMusicQuestionTheme(musics);

  expect(result.title).toBe("Qual o nome do álbum que tem essa capa?");
  expect(result.imageUrl).toBe("album.jpg");
  expect(result.questionType).toBe("aboutAlbumTitle");
});

test("should build the music title question as the default theme", async () => {
  const albumTracks = [{ title: "A" }, { title: "B" }, { title: "C" }];
  const outsideTracks = [
    buildMusic({ title: "Faixa de Fora", album: { id: 999, cover: "", title: "Outro" } }),
  ];

  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutArtistsTopMusic")
    .mockReturnValueOnce(musics[0])
    .mockReturnValueOnce("Faixa de Fora");

  vi.mocked(fetch).mockImplementation(
    async (url) =>
      ({
        ok: true,
        json: async () =>
          (url as string).includes("/album/") ? { data: albumTracks } : { data: outsideTracks },
      }) as Response,
  );

  const result = await getMusicQuestionTheme(musics);

  expect(result.title).toContain(`músicas de ${musics[0].artist.name}`);
});

/* - Testando o retry: um erro dentro do try (ex: pool insuficiente pra montar a pergunta sobre título) deve fazer a função tentar de novo - */

test("should retry building the question when the pool is insufficient", async () => {
  vi.mocked(pickRandomItem)
    .mockReturnValueOnce("aboutMusicTitle")
    .mockReturnValueOnce(musics[0])
    .mockReturnValueOnce("aboutArtistName")
    .mockReturnValueOnce(musics[1]);

  vi.mocked(fetch).mockImplementation(
    async (url) =>
      ({
        ok: true,
        json: async () =>
          (url as string).includes("/album/")
            ? { data: [{ title: "Única Faixa" }] }
            : {
                data: [
                  buildMusic({
                    title: "Única Faixa",
                    album: { id: 20, cover: "", title: "Álbum X" },
                  }),
                ],
              },
      }) as Response,
  );

  const result = await getMusicQuestionTheme(musics);

  expect(result.questionType).toBe("aboutArtistName");
  expect(result.rightAnswer).toBe("Artista Y");
  expect(pickRandomItem).toHaveBeenCalledTimes(4);
});
