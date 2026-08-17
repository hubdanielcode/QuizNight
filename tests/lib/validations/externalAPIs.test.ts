import { test, expect } from "vitest";
import {
  rawgGamesListSchema,
  rawgGameDetailSchema,
  tmdbMoviesListSchema,
  tmdbCreditsSchema,
  deezerMusicsListSchema,
  deezerAlbumMusicsListSchema,
} from "@/lib/validations/externalAPIs";

/* - Testando a lista de jogos da RAWG - */

test("should accept a valid RAWG games list", () => {
  const result = rawgGamesListSchema.safeParse({
    results: [
      {
        id: 1,
        name: "Hollow Knight",
        released: "2017-02-24",
        metacritic: 90,
        platforms: [{ platform: { name: "PC" } }],
        genre: [{ name: "Metroidvania" }],
      },
    ],
  });

  expect(result.success).toBe(true);
});

test("should accept a RAWG game without the optional genre field", () => {
  const result = rawgGamesListSchema.safeParse({
    results: [
      {
        id: 1,
        name: "Hollow Knight",
        released: "2017-02-24",
        metacritic: 90,
        platforms: [{ platform: { name: "PC" } }],
      },
    ],
  });

  expect(result.success).toBe(true);
});

test("should accept an empty RAWG games list", () => {
  const result = rawgGamesListSchema.safeParse({ results: [] });

  expect(result.success).toBe(true);
});

test("should reject a RAWG games list missing a required field", () => {
  const result = rawgGamesListSchema.safeParse({
    results: [
      {
        id: 1,
        name: "Hollow Knight",
        released: "2017-02-24",
        platforms: [{ platform: { name: "PC" } }],
      },
    ],
  });

  expect(result.success).toBe(false);
});

test("should reject a RAWG games list with a wrong field type", () => {
  const result = rawgGamesListSchema.safeParse({
    results: [
      {
        id: 1,
        name: "Hollow Knight",
        released: "2017-02-24",
        metacritic: "90",
        platforms: [{ platform: { name: "PC" } }],
      },
    ],
  });

  expect(result.success).toBe(false);
});

test("should reject a RAWG games list with a malformed platforms entry", () => {
  const result = rawgGamesListSchema.safeParse({
    results: [
      {
        id: 1,
        name: "Hollow Knight",
        released: "2017-02-24",
        metacritic: 90,
        platforms: [{ name: "PC" }],
      },
    ],
  });

  expect(result.success).toBe(false);
});

test("should reject when results is not an array", () => {
  const result = rawgGamesListSchema.safeParse({ results: {} });

  expect(result.success).toBe(false);
});

/* - Testando o detalhe do jogo da RAWG (publishers) - */

test("should accept a valid RAWG game detail", () => {
  const result = rawgGameDetailSchema.safeParse({
    publishers: [{ name: "Team Cherry" }],
  });

  expect(result.success).toBe(true);
});

test("should accept a RAWG game detail with an empty publishers list", () => {
  const result = rawgGameDetailSchema.safeParse({ publishers: [] });

  expect(result.success).toBe(true);
});

test("should reject a RAWG game detail missing publishers", () => {
  const result = rawgGameDetailSchema.safeParse({});

  expect(result.success).toBe(false);
});

test("should reject a RAWG game detail with a malformed publisher entry", () => {
  const result = rawgGameDetailSchema.safeParse({
    publishers: [{ id: 1 }],
  });

  expect(result.success).toBe(false);
});

/* - Testando a lista de filmes do TMDB - */

test("should accept a valid TMDB movies list", () => {
  const result = tmdbMoviesListSchema.safeParse({
    results: [
      {
        id: 1,
        title: "Interestelar",
        release_date: "2014-11-06",
        vote_average: 8.6,
      },
    ],
  });

  expect(result.success).toBe(true);
});

test("should reject a TMDB movies list missing a required field", () => {
  const result = tmdbMoviesListSchema.safeParse({
    results: [
      {
        id: 1,
        title: "Interestelar",
        vote_average: 8.6,
      },
    ],
  });

  expect(result.success).toBe(false);
});

test("should reject a TMDB movies list with a wrong field type", () => {
  const result = tmdbMoviesListSchema.safeParse({
    results: [
      {
        id: 1,
        title: "Interestelar",
        release_date: "2014-11-06",
        vote_average: "8.6",
      },
    ],
  });

  expect(result.success).toBe(false);
});

test("should reject when results is missing entirely", () => {
  const result = tmdbMoviesListSchema.safeParse({});

  expect(result.success).toBe(false);
});

/* - Testando os créditos do TMDB (diretor/equipe) - */

test("should accept valid TMDB credits", () => {
  const result = tmdbCreditsSchema.safeParse({
    crew: [{ job: "Director", name: "Christopher Nolan" }],
  });

  expect(result.success).toBe(true);
});

test("should accept TMDB credits with an empty crew list", () => {
  const result = tmdbCreditsSchema.safeParse({ crew: [] });

  expect(result.success).toBe(true);
});

test("should reject TMDB credits with a malformed crew entry", () => {
  const result = tmdbCreditsSchema.safeParse({
    crew: [{ job: "Director" }],
  });

  expect(result.success).toBe(false);
});

test("should reject TMDB credits missing crew", () => {
  const result = tmdbCreditsSchema.safeParse({});

  expect(result.success).toBe(false);
});

/* - Testando a lista de músicas do Deezer - */

test("should accept a valid Deezer musics list", () => {
  const result = deezerMusicsListSchema.safeParse({
    data: [
      {
        id: 1,
        title: "Sunflower",
        rank: 900000,
        artist: { id: 10, name: "Post Malone", picture: "https://example.com/pic.jpg" },
        album: { id: 20, cover: "https://example.com/cover.jpg", title: "Hollywood's Bleeding" },
      },
    ],
  });

  expect(result.success).toBe(true);
});

test("should reject a Deezer musics list with a malformed artist entry", () => {
  const result = deezerMusicsListSchema.safeParse({
    data: [
      {
        id: 1,
        title: "Sunflower",
        rank: 900000,
        artist: { id: 10, name: "Post Malone" },
        album: { id: 20, cover: "https://example.com/cover.jpg", title: "Hollywood's Bleeding" },
      },
    ],
  });

  expect(result.success).toBe(false);
});

test("should reject a Deezer musics list with a malformed album entry", () => {
  const result = deezerMusicsListSchema.safeParse({
    data: [
      {
        id: 1,
        title: "Sunflower",
        rank: 900000,
        artist: { id: 10, name: "Post Malone", picture: "https://example.com/pic.jpg" },
        album: { id: 20, title: "Hollywood's Bleeding" },
      },
    ],
  });

  expect(result.success).toBe(false);
});

test("should reject a Deezer musics list with a wrong field type", () => {
  const result = deezerMusicsListSchema.safeParse({
    data: [
      {
        id: 1,
        title: "Sunflower",
        rank: "900000",
        artist: { id: 10, name: "Post Malone", picture: "https://example.com/pic.jpg" },
        album: { id: 20, cover: "https://example.com/cover.jpg", title: "Hollywood's Bleeding" },
      },
    ],
  });

  expect(result.success).toBe(false);
});

test("should reject when data is not an array", () => {
  const result = deezerMusicsListSchema.safeParse({ data: {} });

  expect(result.success).toBe(false);
});

/* - Testando as faixas do álbum no Deezer - */

test("should accept a valid Deezer album musics list", () => {
  const result = deezerAlbumMusicsListSchema.safeParse({
    data: [{ title: "Sunflower" }, { title: "Circles" }],
  });

  expect(result.success).toBe(true);
});

test("should accept an empty Deezer album musics list", () => {
  const result = deezerAlbumMusicsListSchema.safeParse({ data: [] });

  expect(result.success).toBe(true);
});

test("should reject a Deezer album musics list with a malformed entry", () => {
  const result = deezerAlbumMusicsListSchema.safeParse({
    data: [{ id: 1 }],
  });

  expect(result.success).toBe(false);
});

test("should reject a Deezer album musics list missing data", () => {
  const result = deezerAlbumMusicsListSchema.safeParse({});

  expect(result.success).toBe(false);
});
