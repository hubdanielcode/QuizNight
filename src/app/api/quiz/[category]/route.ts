import { NextResponse } from "next/server";
import { fetchGames, getGameQuestionTheme } from "@/lib/fetchers/getGameQuestion";
import { fetchMovies, getMovieQuestionTheme } from "@/lib/fetchers/getMovieQuestion";
import { fetchMusics, getMusicQuestionTheme } from "@/lib/fetchers/getMusicQuestion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;

  try {
    if (category === "jogos") {
      const games = await fetchGames();
      const result = await getGameQuestionTheme(games);
      return NextResponse.json({ ...result, category: "jogos" as const });
    }

    if (category === "filmes") {
      const movies = await fetchMovies();
      const result = await getMovieQuestionTheme(movies);
      return NextResponse.json({ ...result, category: "filmes" as const });
    }

    if (category === "musicas") {
      const musics = await fetchMusics();
      const result = await getMusicQuestionTheme(musics);
      return NextResponse.json({ ...result, category: "musicas" as const });
    }

    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao buscar pergunta:", error);
    return NextResponse.json({ error: "failed to fetch question" }, { status: 500 });
  }
}
