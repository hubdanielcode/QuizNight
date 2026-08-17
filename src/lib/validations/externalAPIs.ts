import z from "zod";

/* - API de jogos (RAWG) - */

const rawgGameSchema = z.object({
  id: z.number(),
  name: z.string(),
  released: z.string(),
  metacritic: z.number(),
  platforms: z.array(z.object({ platform: z.object({ name: z.string() }) })),
  genre: z.array(z.object({ name: z.string() })).optional(),
});

const rawgGamesListSchema = z.object({
  results: z.array(rawgGameSchema),
});

const rawgGameDetailSchema = z.object({
  publishers: z.array(z.object({ name: z.string() })),
});

/* - API de filmes (TMDB) - */

const tmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  release_date: z.string(),
  vote_average: z.number(),
});

const tmdbMoviesListSchema = z.object({
  results: z.array(tmdbMovieSchema),
});

const tmdbCreditsSchema = z.object({
  crew: z.array(z.object({ job: z.string(), name: z.string() })),
});

/* - API de músicas (Deezer) - */

const deezerMusicSchema = z.object({
  id: z.number(),
  title: z.string(),
  rank: z.number(),
  artist: z.object({ id: z.number(), name: z.string(), picture: z.string() }),
  album: z.object({ id: z.number(), cover: z.string(), title: z.string() }),
});

const deezerMusicsListSchema = z.object({
  data: z.array(deezerMusicSchema),
});

const deezerAlbumMusicSchema = z.object({
  title: z.string(),
});

const deezerAlbumMusicsListSchema = z.object({
  data: z.array(deezerAlbumMusicSchema),
});

export {
  rawgGamesListSchema,
  rawgGameDetailSchema,
  tmdbMoviesListSchema,
  tmdbCreditsSchema,
  deezerMusicsListSchema,
  deezerAlbumMusicsListSchema,
};
