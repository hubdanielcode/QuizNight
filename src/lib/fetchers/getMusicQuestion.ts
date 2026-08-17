import { MusicProps, MusicQuestionPossibilities } from "@/types/musics";
import { cleanTitle, pickRandomItem, getAlternatives, shuffleArray } from "./quizHelpers";
import {
  deezerMusicsListSchema,
  deezerAlbumMusicsListSchema,
} from "@/lib/validations/externalAPIs";

/* - Definindo as configurações para limitar o tempo de espera e o número de tentativas ao consultar a API - */

const deezerFetchTimeout = 8000;
const maxAttemptsToCreateQuestion = 5;

/* - Fazendo a chamada na API para buscar a lista de músicas - */

const fetchMusics = async () => {
  const response = await fetch("https://api.deezer.com/chart/0/tracks", {
    cache: "no-store",
    signal: AbortSignal.timeout(deezerFetchTimeout),
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar a lista de músicas");
  }

  const data = await response.json();
  const result = deezerMusicsListSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Formato inesperado na resposta da lista de músicas");
  }

  return result.data.data;
};

/* - Buscando as músicas mais escutadas do artista sorteado - */

const fetchArtistsTopMusics = async (artistId: number): Promise<MusicProps[]> => {
  const response = await fetch(`https://api.deezer.com/artist/${artistId}/top`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar as músicas desse artista");
  }

  const data = await response.json();
  const result = deezerMusicsListSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Formato inesperado na resposta das músicas do artista");
  }

  return result.data.data;
};

/* - Decidindo qual vai ser o tema da pergunta - */

const getMusicQuestionTheme = async (musics: MusicProps[], attempt = 0) => {
  const questionType = pickRandomItem(MusicQuestionPossibilities);
  const selectedMusic = pickRandomItem(musics);
  const artistId = selectedMusic.artist.id;

  try {
    let title: string;
    let imageUrl: string | undefined;
    let rightAnswer: string | number | undefined;
    let possibleAnswers: (string | number)[];

    if (questionType === "aboutArtistName") {
      const result = getArtistName(musics, selectedMusic);

      title = "Qual o nome desse(a) artista?";
      imageUrl = selectedMusic.artist.picture;
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    } else if (questionType === "aboutAlbumTitle") {
      const result = getAlbumTitle(musics, selectedMusic);

      title = "Qual o nome do álbum que tem essa capa?";
      imageUrl = selectedMusic.album.cover;
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    } else if (questionType === "aboutMusicTitle") {
      const result = await getMusicTitle(artistId, selectedMusic);

      title = `Qual dessas 4 músicas de ${selectedMusic.artist.name} não está presente no álbum "${selectedMusic.album.title}"?`;
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    } else {
      const result = await getArtistsTopMusics(artistId);

      title = `Dentre essas 4 músicas de ${selectedMusic.artist.name}, qual é a mais escutada?`;
      rightAnswer = result.rightAnswer;
      possibleAnswers = result.possibleAnswers;
    }
    return { title, imageUrl, rightAnswer, possibleAnswers, questionType };
  } catch (error) {
    if (attempt >= maxAttemptsToCreateQuestion) {
      throw error;
    }

    return getMusicQuestionTheme(musics, attempt + 1);
  }
};

/* - Sorteando o nome e a imagem do artista para fazer a pergunta sobre o nome - */

const getArtistName = (musics: MusicProps[], selectedMusic: MusicProps) => {
  const artistsList = musics.map((music) => cleanTitle(music.artist.name));
  const rightAnswer = cleanTitle(selectedMusic.artist.name);
  const possibleAnswers = getAlternatives(artistsList, 3, rightAnswer);

  return { possibleAnswers, rightAnswer };
};

/* - Buscando a foto da capa do album para fazer a pergunta sobre o album - */

const getAlbumTitle = (musics: MusicProps[], selectedMusic: MusicProps) => {
  const albumsList = musics.map((music) => cleanTitle(music.album.title));
  const rightAnswer = cleanTitle(selectedMusic.album.title);
  const possibleAnswers = getAlternatives(albumsList, 3, rightAnswer);

  return { possibleAnswers, rightAnswer };
};

/* - Buscando as faixas do álbum da música sorteada e comparando com o top do artista, para fazer a pergunta sobre qual música não pertence ao álbum - */

const getMusicTitle = async (artistId: number, selectedMusic: MusicProps) => {
  const [response, artistsMusicsList] = await Promise.all([
    fetch(`https://api.deezer.com/album/${selectedMusic.album.id}/tracks`, { cache: "no-store" }),
    fetchArtistsTopMusics(artistId),
  ]);

  if (!response.ok) {
    throw new Error("Erro ao buscar as faixas desse álbum");
  }

  const data = await response.json();
  const parsedAlbumMusics = deezerAlbumMusicsListSchema.safeParse(data);

  if (!parsedAlbumMusics.success) {
    throw new Error("Formato inesperado na resposta das faixas do álbum");
  }

  const selectedAlbumMusics = parsedAlbumMusics.data.data;
  const sameAlbumTitles = selectedAlbumMusics.map((music) => cleanTitle(music.title));

  const otherAlbumTitles = artistsMusicsList
    .filter((music) => music.album.id !== selectedMusic.album.id)
    .map((music) => cleanTitle(music.title));

  if (new Set(sameAlbumTitles).size < 3 || otherAlbumTitles.length < 1) {
    throw new Error("Pool insuficiente de músicas para gerar a pergunta");
  }

  const rightAnswer = pickRandomItem(otherAlbumTitles);
  const possibleAnswers = getAlternatives(sameAlbumTitles, 3, rightAnswer);

  return { rightAnswer, possibleAnswers };
};

/* - Comparando quatro músicas do mesmo artista para fazer a pergunta sobre mais escutada - */

const getArtistsTopMusics = async (artistId: number) => {
  const artistsMusicsList = await fetchArtistsTopMusics(artistId);
  const shuffledList = shuffleArray(artistsMusicsList).slice(0, 4);
  const ranks = shuffledList.map((music) => music.rank);
  const highestRank = Math.max(...ranks);

  if (!highestRank) {
    throw new Error("Não foi possível determinar a música mais escutada");
  }

  const rightAnswer = cleanTitle(
    shuffledList.find((music) => music.rank === highestRank)?.title ?? "",
  );

  const possibleAnswers = shuffledList.map((music) => cleanTitle(music.title));
  return { possibleAnswers, rightAnswer };
};

export {
  fetchMusics,
  fetchArtistsTopMusics,
  getMusicQuestionTheme,
  getArtistName,
  getAlbumTitle,
  getMusicTitle,
  getArtistsTopMusics,
};
