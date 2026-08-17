export interface MusicProps {
  id: number;
  title: string;
  rank: number;
  artist: {
    id: number;
    name: string;
    picture: string;
  };
  album: {
    id: number;
    cover: string;
    title: string;
  };
}

export interface MusicQuestionProps {
  id: number;
  questionType: string;
  selectedMusic: MusicProps;
  title: string;
  possibleAnswers: string[];
  rightAnswer: string;
  wrongAnswers: string[];
}

export const MusicQuestionPossibilities = [
  "aboutArtistName",
  "aboutAlbumTitle",
  "aboutMusicTitle",
  "aboutArtistsTopMusic",
];
