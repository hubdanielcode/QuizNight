import z from "zod";

const questionSchema = z.object({
  questionId: z.string(),
  questionCategory: z.enum(["jogos", "filmes", "musicas"]),
  questionType: z.enum([
    // 1. Jogos

    "aboutGameName",
    "aboutGameReleaseYear",
    "aboutGameAverageRating",
    "aboutGameAvailablePlatforms",

    // 2. Filmes

    "aboutMovieName",
    "aboutMovieReleaseYear",
    "aboutMovieRating",
    "aboutMovieDirectorName",

    // 3. Musicas

    "aboutArtistName",
    "aboutAlbumTitle",
    "aboutMusicTitle",
    "aboutArtistsTopMusic",
  ]),

  title: z.string(),
  imageUrl: z.string().optional(),
  possibleAnswers: z.array(z.string()).min(4),
  selectedAnswer: z.string().optional(),
  rightAnswer: z.string(),
  sessionId: z.string(),
});

const sessionSchema = z.object({
  sessionId: z.string(),
  questions: z.array(questionSchema),
  score: z.int().default(0),
  reasonWhyGameEnded: z.enum(["wrongAnswer", "timesUp"]).optional(),
  sessionStatus: z.enum(["active", "finished"]).default("active"),
});

const answerSchema = questionSchema.pick({ questionId: true, selectedAnswer: true }).required();

export { questionSchema, sessionSchema, answerSchema };
