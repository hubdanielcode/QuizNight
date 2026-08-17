export interface MovieProps {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  backdrop_path: string;
}

export interface MovieQuestionProps {
  id: number;
  questionType: string;
  selectedMovie: MovieProps;
  title: string;
  possibleAnswers: string[];
  rightAnswer: string;
  wrongAnswers: string[];
}

export const MovieQuestionPossibilities = [
  "aboutMovieName",
  "aboutMovieReleaseYear",
  "aboutMovieRating",
  "aboutMovieDirectorName",
];
