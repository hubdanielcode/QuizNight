export interface GameProps {
  id: number;
  name: string;
  publishers?: {
    name: string;
  }[];
  released: string;
  metacritic: number;
  platforms: {
    platform: {
      name: string;
    };
  }[];
  genre: {
    name: string;
  }[];
}

export interface GameQuestionProps {
  id: number;
  questionType: string;
  selectedGame: GameProps;
  title: string;
  publisher: string;
  possibleAnswers: string[];
  rightAnswer: string;
  wrongAnswers: string[];
}

export const GameQuestionPossibilities = [
  "aboutGameName",
  "aboutGameReleaseYear",
  "aboutGameAverageRating",
  "aboutGameAvailablePlatforms",
];

export const allPlatforms = [
  "PC",
  "Xbox One",
  "Xbox 360",
  "Xbox Series S/X",
  "PlayStation 5",
  "PlayStation 4",
  "PlayStation 3",
  "Nintendo Switch",
  "Wii",
  "Wii U",
  "macOS",
  "iOS",
  "Android",
  "Linux",
];
