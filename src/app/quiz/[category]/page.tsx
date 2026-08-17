import { BonusCategoryModal } from "@/components/quiz/BonusCategoryModal";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { QuizGame } from "@/components/quiz/QuizGame";

const QuestionPage = async ({ params }: { params: Promise<{ category: string }> }) => {
  const { category } = await params;

  if (category !== "jogos" && category !== "filmes" && category !== "musicas") {
    return <BonusCategoryModal />;
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  let initialScore = 0;

  if (sessionId) {
    const quizSession = await prisma.quizSession.findUnique({ where: { sessionId: sessionId } });

    if (!quizSession || quizSession.sessionStatus !== "active") {
      redirect("/");
    }

    initialScore = quizSession.score;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(circle_at_75%_30%,#2E1F5E_0%,#1A1235_45%,#0D0818_100%),linear-gradient(135deg,rgba(64,118,195,0.08)_0%,transparent_50%)] bg-blend-screen">
      <div className="w-full mx-auto pt-18">
        <QuizGame
          category={category}
          initialScore={initialScore}
          
        />
      </div>
    </div>
  );
};

export default QuestionPage;
