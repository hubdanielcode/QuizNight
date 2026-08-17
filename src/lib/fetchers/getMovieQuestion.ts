import { MovieProps, MovieQuestionPossibilities } from "@/types/movies";
import {
  cleanTitle,
  pickRandomItem,
  getAlternatives,
  shuffleArray,
} from "@/lib/fetchers/quizHelpers";
import { tmdbMoviesListSchema, tmdbCreditsSchema } from "@/lib/validations/externalAPIs";

/* - Definindo as configurações para limitar o tempo de espera e o número de tentativas ao consultar a API - */

const tmdbFetchTimeout = 8000;
const maxAttemptsToCreateQuestion = 5;

/* - Fazendo a chamada na API para buscar a lista de filmes - */

const fetchMovies = async () => {
  const pages = await Promise.all(
    [1, 2, 3].map(async (page) => {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&sort_by=popularity.desc&page=${page}`,
        { cache: "no-store", signal: AbortSignal.timeout(tmdbFetchTimeout) },
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar a lista de filmes");
      }
      const data = await response.json();
      const result = tmdbMoviesListSchema.safeParse(data);

      if (!result.success) {
        throw new Error("Formato inesperado na resposta da lista de filmes");
      }

      return result.data;
    }),
  );
  return pages.flatMap((page) => page.results) as MovieProps[];
};

/* - Fazendo a chamada na API para buscar o nome do diretor do filme sorteado - */

const fetchMovieDirector = async (movieId: number) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar o nome do diretor do filme sorteado");
  }

  const data = await response.json();
  const result = tmdbCreditsSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Formato inesperado na resposta dos créditos do filme");
  }

  const director = result.data.crew.find((person) => person.job === "Director");

  return director?.name;
};

/* - Decidindo qual vai ser o tema da pergunta - */

const getMovieQuestionTheme = async (movies: MovieProps[], attempt = 0) => {
  const questionType = pickRandomItem(MovieQuestionPossibilities);
  const selectedMovie = pickRandomItem(movies);

  try {
    const director = await fetchMovieDirector(selectedMovie.id);
    const releaseYear = getMovieReleaseYear(movies, selectedMovie);

    let title: string;
    let rightAnswer: string | number;
    let possibleAnswers: (string | number)[];

    if (questionType === "aboutMovieName") {
      const result = getMovieName(movies, selectedMovie);

      title = `Qual dos filmes abaixo foi lançado em ${releaseYear.rightAnswer} e dirigido por ${director}?`;
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    } else if (questionType === "aboutMovieReleaseYear") {
      const result = getMovieReleaseYear(movies, selectedMovie);

      title = `Em qual ano foi lançado o filme ${selectedMovie.title}?`;
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    } else if (questionType === "aboutMovieRating") {
      const result = getMovieRating(movies);

      title = "Dentre os filmes abaixo, qual teve a melhor avaliação?";
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    } else {
      const result = await getMovieDirectorName(movies, selectedMovie);

      title = `Quem foi o diretor responsável pelo filme ${selectedMovie.title}?`;
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    }

    return { title, rightAnswer, possibleAnswers, questionType };
  } catch (error) {
    if (attempt >= maxAttemptsToCreateQuestion) {
      throw error;
    }

    return getMovieQuestionTheme(movies, attempt + 1);
  }
};

/* - Comparando o rating de quatro filmes para fazer a pergunta de rating - */

const getMovieRating = (movies: MovieProps[]) => {
  const moviesList = shuffleArray(movies).slice(0, 4);
  const moviesTitles = moviesList.map((movie) => cleanTitle(movie.title));
  const moviesRatings = moviesList.map((movie) => movie.vote_average);
  const highestRating = Math.max(...moviesRatings);
  const bestRatedMovie = moviesList.find((movie) => movie.vote_average === highestRating);

  if (!bestRatedMovie) {
    throw new Error("Não foi possível determinar o filme com maior nota");
  }

  const rightAnswer = cleanTitle(bestRatedMovie.title);
  const possibleAnswers = getAlternatives(moviesTitles, 3, rightAnswer);

  return { possibleAnswers, rightAnswer };
};

/* - Buscando o nome do diretor do filme para fazer a pergunta sobre diretor - */

const getMovieDirectorName = async (movies: MovieProps[], selectedMovie: MovieProps) => {
  const directorsList = await Promise.all(
    movies.map(async (movie) => cleanTitle((await fetchMovieDirector(movie.id)) ?? "")),
  );

  const selectedMovieIndex = movies.indexOf(selectedMovie);
  const rightAnswer = directorsList[selectedMovieIndex];
  const possibleAnswers = getAlternatives(directorsList, 3, rightAnswer);

  return { rightAnswer, possibleAnswers };
};

/* - Sorteando o nome e a imagem do filme para fazer a pergunta sobre o nome - */

const getMovieName = (movies: MovieProps[], selectedMovie: MovieProps) => {
  const moviesList = movies.map((movie) => cleanTitle(movie.title));
  const rightAnswer = cleanTitle(selectedMovie.title);
  const possibleAnswers = getAlternatives(moviesList, 3, rightAnswer);

  return { possibleAnswers, rightAnswer };
};

/* - Sorteando o ano de lançamento do filme para fazer a pergunta sobre ano de lançamento - */

const getMovieReleaseYear = (movies: MovieProps[], selectedMovie: MovieProps) => {
  const moviesList = movies.map((movie) => new Date(movie.release_date).getFullYear());
  const rightAnswer = new Date(selectedMovie.release_date).getFullYear();
  const possibleAnswers = getAlternatives(moviesList, 3, rightAnswer);

  return { possibleAnswers, rightAnswer };
};

export {
  fetchMovies,
  fetchMovieDirector,
  getMovieQuestionTheme,
  getMovieRating,
  getMovieDirectorName,
  getMovieName,
  getMovieReleaseYear,
};
