import { GameProps, GameQuestionPossibilities, allPlatforms } from "@/types/games";
import { cleanTitle, getAlternatives, pickRandomItem } from "@/lib/fetchers/quizHelpers";
import { rawgGameDetailSchema, rawgGamesListSchema } from "@/lib/validations/externalAPIs";

/* - Definindo as configurações para limitar o tempo de espera e o número de tentativas ao consultar a API - */

const rawgFetchTimeout = 8000;
const maxAttemptsToCreateQuestion = 5;

/* - Fazendo a chamada na API para buscar a lista de jogos - */

const fetchGames = async (): Promise<GameProps[]> => {
  const response = await fetch(
    `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&page_size=40`,
    { cache: "no-store", signal: AbortSignal.timeout(rawgFetchTimeout) },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar lista de jogos");
  }

  const data = await response.json();
  const result = rawgGamesListSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Formato inesperado na resposta da lista de jogos");
  }

  return result.data.results as GameProps[];
};

/* - Fazendo a chamada na API para buscar a desenvolvedora do jogo sorteado - */

const fetchGamePublisher = async (gameId: number): Promise<string> => {
  const response = await fetch(
    `https://api.rawg.io/api/games/${gameId}?key=${process.env.RAWG_API_KEY}`,
    { cache: "no-store", signal: AbortSignal.timeout(rawgFetchTimeout) },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar desenvolvedora do jogo");
  }

  const data = await response.json();
  const result = rawgGameDetailSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Formato inesperado na resposta da desenvolvedora do jogo");
  }

  return result.data.publishers[0]?.name;
};

/* - Decidindo qual vai ser o tema da pergunta - */

const getGameQuestionTheme = async (games: GameProps[], attempt = 0) => {
  const questionType = pickRandomItem(GameQuestionPossibilities);
  const selectedGame = pickRandomItem(games);

  try {
    const releaseYear = getGameReleaseYear(games, selectedGame);

    let title: string;
    let rightAnswer: string | number;
    let possibleAnswers: (string | number)[];
    let publisher: string | undefined;

    if (questionType === "aboutGameAverageRating") {
      const result = getGameAverageRating(games, selectedGame);

      title = `De acordo com o Metacritic, em qual desses intervalos encontra-se a nota dada ao jogo ${selectedGame.name}?`;
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    } else if (questionType === "aboutGameAvailablePlatforms") {
      const result = getAvailablePlatforms(selectedGame);

      publisher = await fetchGamePublisher(selectedGame.id);

      title = `Publicado pela ${publisher}, ${selectedGame.name} está disponível em qual dessas plataformas?`;
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    } else if (questionType === "aboutGameName") {
      const result = getGameName(games, selectedGame);

      publisher = await fetchGamePublisher(selectedGame.id);

      title = `Qual dos jogos abaixo foi lançado no ano de ${releaseYear.rightAnswer}, pela ${publisher}?`;
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    } else {
      const result = getGameReleaseYear(games, selectedGame);

      title = `Em qual ano foi lançado o jogo ${selectedGame.name}?`;
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    }

    return {
      title,
      publisher,
      rightAnswer,
      possibleAnswers,
      selectedGame,
      questionType,
    };
  } catch (error) {
    if (attempt >= maxAttemptsToCreateQuestion) {
      throw error;
    }

    return getGameQuestionTheme(games, attempt + 1);
  }
};

/* - Calculando o intervalo de rating com base no metacritic para fazer a pergunta sobre rating - */

const getGameAverageRating = (games: GameProps[], selectedGame: GameProps) => {
  const gamesList = games.map((game) => {
    const ratingIntervalStart = Math.max(Math.floor(game.metacritic / 5) * 5, 50);
    const ratingIntervalEnd = ratingIntervalStart === 100 ? 100 : ratingIntervalStart + 5;
    return `${ratingIntervalStart} - ${ratingIntervalEnd}`;
  });

  const ratingIntervalStart = Math.max(Math.floor(selectedGame.metacritic / 5) * 5, 50);
  const ratingIntervalEnd = ratingIntervalStart === 100 ? 100 : ratingIntervalStart + 5;
  const rightAnswer = `${ratingIntervalStart} - ${ratingIntervalEnd}`;
  const possibleAnswers = getAlternatives(gamesList, 3, rightAnswer);
  return { rightAnswer, possibleAnswers, selectedGame };
};

/* - Vendo em quais plataformas o jogo está disponível para fazer a pergunta sobre plataformas - */

const getAvailablePlatforms = (selectedGame: GameProps) => {
  const platformsWhereGameIsAvailable = selectedGame.platforms.map((entry) =>
    cleanTitle(entry.platform.name),
  );
  const platformsWhereGameIsNotAvailable = allPlatforms
    .map((platform) => cleanTitle(platform))
    .filter((platform) => !platformsWhereGameIsAvailable.includes(platform));

  const rightAnswer = pickRandomItem(platformsWhereGameIsAvailable);
  const possibleAnswers = getAlternatives(platformsWhereGameIsNotAvailable, 3, rightAnswer);
  return { rightAnswer, possibleAnswers };
};

/* - Sorteando o nome e a desenvolvedora do jogo para fazer a pergunta sobre o nome - */

const getGameName = (games: GameProps[], selectedGame: GameProps) => {
  const gamesList = games.map((game) => cleanTitle(game.name));
  const rightAnswer = cleanTitle(selectedGame.name);
  const possibleAnswers = getAlternatives(gamesList, 3, rightAnswer);
  return { rightAnswer, possibleAnswers };
};

/* - Sorteando o ano de lançamento do jogo para fazer a pergunta sobre ano de lançamento - */

const getGameReleaseYear = (games: GameProps[], selectedGame: GameProps) => {
  const gamesList = games.map((game) => new Date(game.released).getFullYear());
  const rightAnswer = new Date(selectedGame.released).getFullYear();
  const possibleAnswers = getAlternatives(gamesList, 3, rightAnswer);
  return { rightAnswer, possibleAnswers };
};

export {
  fetchGames,
  fetchGamePublisher,
  getGameQuestionTheme,
  getGameAverageRating,
  getAvailablePlatforms,
  getGameName,
  getGameReleaseYear,
};
