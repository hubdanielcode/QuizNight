"use client";

import { createQuestion, submitAnswer, finishSession } from "@/actions/quiz";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TimeBar } from "./TimeBar";
import Image from "next/image";
import { AnswersList } from "./AnswersList";
import { PlayAgain } from "./PlayAgain";
import Loading from "../ui/Loading";
import ErrorBoundary from "@/app/error";
import { validateGame } from "@/actions/validateGame";

type QuestionResponseType = Awaited<ReturnType<typeof createQuestion>>;
type VerifyAnswerResponseType = Awaited<ReturnType<typeof submitAnswer>>;

interface QuizGameProps {
  category: "jogos" | "filmes" | "musicas";
  initialScore: number;
}

const QuizGame = ({ category, initialScore = 0 }: QuizGameProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [question, setQuestion] = useState<QuestionResponseType | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [verifyAnswer, setVerifyAnswer] = useState<VerifyAnswerResponseType | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [reasonWhyGameEnded, setReasonWhyGameEnded] = useState<"wrongAnswer" | "timesUp" | null>(
    null,
  );
  const [score, setScore] = useState<number>(initialScore);

  const router = useRouter();
  const hasFetchedRef = useRef(false);

  /* - Buscando a pergunta via server action - */

  const fetchQuestion = async () => {
    try {
      const question = await createQuestion(category);
      setQuestion(question);
    } catch (error) {
      setError("Erro ao buscar a pergunta no banco de dados.");
    } finally {
      setIsLoading(false);
    }
  };

  /* - Garantindo que a função não seja chamada duas vezes e polua o banco - */

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    fetchQuestion();
  }, []);

  /* - Salvando a resposta selecionada pelo usuário - */

  const handleSubmitAnswer = async (selectedAnswer: string) => {
    if (!question) {
      return;
    }

    const submitAnswerResult = await submitAnswer(question.questionId, selectedAnswer);
    setVerifyAnswer(submitAnswerResult);
    setIsAnswered(true);

    if (submitAnswerResult.isCorrect) {
      setScore((prev) => prev + 1);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.push("/quiz");
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsGameOver(true);
      setReasonWhyGameEnded("wrongAnswer");
    }
  };

  /* - Fechando a sessão no banco quando o tempo acaba, antes de abrir o modal de fim de jogo - */

  const handleTimesUp = async () => {
    if (isAnswered) {
      return;
    }

    await finishSession("timesUp");
    setIsGameOver(true);
    setReasonWhyGameEnded("timesUp");
  };

  /* - Encerrando a sessão atual (deleta o cookie sessionId) e navegando de volta pra roleta; createQuestion cria uma sessão nova com score zerado e status "active" assim que o QuizGame remontar - */

  const handlePlayAgain = async () => {
    await validateGame();
    router.push("/quiz");
  };

  if (error) {
    return <ErrorBoundary />;
  }

  if (isLoading || !question) {
    return <Loading />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <TimeBar
          onTimeIsUp={handleTimesUp}
          isAnswered={isAnswered}
        />
      </div>

      <div className="flex w-full mb-8 items-center justify-center bg-white/20 border border-white/30 rounded-xl px-4 py-2">
        {question?.questionCategory === "jogos" && (
          <div className="flex flex-col items-center justify-center p-3 min-w-0 w-full">
            <span className="bg-linear-to-br bg-clip-text from-amber-400 via-amber-500 to-amber-600 text-transparent font-semibold text-center tracking-[0.2em] uppercase pb-4">
              {question.questionCategory}
            </span>

            <span className="text-xl text-white font-semibold w-full text-center">
              {question.title}{" "}
            </span>
          </div>
        )}

        {question?.questionCategory === "filmes" && (
          <div className="flex flex-col items-center justify-center p-3 min-w-0 w-full">
            <span className="bg-linear-to-br bg-clip-text from-amber-400 via-amber-500 to-amber-600 text-transparent font-semibold text-center tracking-[0.2em] uppercase pb-4">
              {question.questionCategory}
            </span>

            <span className="text-lg text-white font-semibold w-full text-center">
              {question.title}{" "}
            </span>
          </div>
        )}

        {question?.questionCategory === "musicas" && (
          <div className="flex flex-col items-center justify-center p-3 min-w-0 w-full">
            <span className="bg-linear-to-br bg-clip-text from-amber-400 via-amber-500 to-amber-600 text-transparent font-semibold text-center tracking-[0.2em] uppercase pb-4">
              {question.questionCategory}
            </span>

            {question.imageUrl && (
              <Image
                className="object-cover mb-3 rounded-xl shadow-lg shadow-black"
                src={question.imageUrl}
                alt={question.title}
                width={90}
                height={90}
              />
            )}

            <span className="text-lg text-white font-semibold w-full text-center">
              {question.title}{" "}
            </span>
          </div>
        )}
      </div>

      <AnswersList
        possibleAnswers={question.possibleAnswers}
        submitAnswerResult={verifyAnswer}
        onSelectAnswer={handleSubmitAnswer}
      />

      <PlayAgain
        isOpen={isGameOver}
        score={score}
        gameEnded={reasonWhyGameEnded}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
};

export { QuizGame };
