"use server";

import { after } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { fetchGames, getGameQuestionTheme } from "@/lib/fetchers/getGameQuestion";
import { fetchMovies, getMovieQuestionTheme } from "@/lib/fetchers/getMovieQuestion";
import { fetchMusics, getMusicQuestionTheme } from "@/lib/fetchers/getMusicQuestion";
import { QuestionCategory, QuestionType } from "@/prisma/generated/prisma/enums";
import { answerSchema } from "@/lib/validations/quiz";

const createQuestion = async (category: "jogos" | "filmes" | "musicas") => {
  const cookieStore = await cookies();
  const cookieData = cookieStore.get("sessionId");
  let sessionId = cookieData?.value;

  /* - Montando a pergunta com base na categoria na qual a roleta parou - */

  let questionTheme:
    | Awaited<ReturnType<typeof getGameQuestionTheme>>
    | Awaited<ReturnType<typeof getMovieQuestionTheme>>
    | Awaited<ReturnType<typeof getMusicQuestionTheme>>;

  if (category === "jogos") {
    const gamesList = await fetchGames();
    questionTheme = await getGameQuestionTheme(gamesList);
  } else if (category === "filmes") {
    const moviesList = await fetchMovies();
    questionTheme = await getMovieQuestionTheme(moviesList);
  } else if (category === "musicas") {
    const musicsList = await fetchMusics();
    questionTheme = await getMusicQuestionTheme(musicsList);
  } else {
    throw new Error("Categoria inválida");
  }

  /* - Confirmando se o usuário já tem sessão ou se precisa criar uma nova - */

  if (!sessionId) {
    const newSession = await prisma.quizSession.create({});
    sessionId = newSession.sessionId;
    cookieStore.set("sessionId", sessionId, { httpOnly: true, maxAge: 30 * 60 });
  }

  const createdQuestion = await prisma.question.create({
    data: {
      questionCategory: category as QuestionCategory,
      questionType: questionTheme.questionType as QuestionType,
      title: questionTheme.title,
      imageUrl: "imageUrl" in questionTheme ? questionTheme.imageUrl : null,
      possibleAnswers: questionTheme.possibleAnswers.map((answer) => answer.toString()),
      rightAnswer: questionTheme.rightAnswer.toString(),
      sessionId,
    },
  });

  return {
    questionId: createdQuestion.questionId,
    questionCategory: createdQuestion.questionCategory,
    title: createdQuestion.title,
    imageUrl: createdQuestion.imageUrl,
    possibleAnswers: createdQuestion.possibleAnswers,
  };
};

const submitAnswer = async (questionId: string, selectedAnswer: string) => {
  /* - Validando o formato do payload antes de qualquer acesso a cookie ou banco - */

  const result = answerSchema.safeParse({ questionId, selectedAnswer });

  if (!result.success) {
    throw new Error("Payload de resposta inválido.");
  }

  const { questionId: safeQuestionId, selectedAnswer: safeSelectedAnswer } = result.data;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    throw new Error("Sessão não encontrada.");
  }

  /* - Buscando a pergunta que o usuário respondeu - */

  const question = await prisma.question.findUnique({
    where: { questionId: safeQuestionId },
  });

  if (!question || question.sessionId !== sessionId) {
    throw new Error("Erro ao buscar qual pergunta foi respondida.");
  }

  const isCorrect = safeSelectedAnswer === question.rightAnswer;

  /* - Salvando a resposta escolhida e atualizando o score depois de responder ao cliente, pra não segurar a UI numa escrita que ele não precisa esperar - */

  after(async () => {
    try {
      await prisma.question.update({
        where: { questionId: safeQuestionId },
        data: { selectedAnswer: safeSelectedAnswer },
      });

      await prisma.quizSession.update({
        where: { sessionId: sessionId },
        data: isCorrect
          ? { score: { increment: 1 } }
          : { sessionStatus: "finished", reasonWhyGameEnded: "wrongAnswer" },
      });
    } catch (error) {
      console.error("Erro ao salvar resposta/score em background:", error);
    }
  });

  return {
    isCorrect,
    rightAnswer: question.rightAnswer,
  };
};

/* - Encerrando a sessão no banco quando o tempo acaba, pro estado real da partida não depender só do componente no client - */

const finishSession = async (reason: "wrongAnswer" | "timesUp" | "leftGame") => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    return;
  }

  try {
    await prisma.quizSession.update({
      where: { sessionId },
      data: { sessionStatus: "finished", reasonWhyGameEnded: reason },
    });
  } catch (error) {
    console.error("Erro ao finalizar a sessão:", error);
  }
};

export { createQuestion, submitAnswer, finishSession };
