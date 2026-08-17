import { SpinningWheel } from "../../components/quiz/SpinningWheel";

const QuizPage = async () => {
  /* - Delay para exibir o loading.tsx - */

  await new Promise((resolve) => setTimeout(resolve, 4000));

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-[radial-gradient(circle_at_75%_30%,#2E1F5E_0%,#1A1235_45%,#0D0818_100%),linear-gradient(135deg,rgba(64,118,195,0.08)_0%,transparent_50%)] bg-blend-screen">
      <div className="pt-18 pb-9">
        <SpinningWheel showButton={true} />
      </div>
    </div>
  );
};

export default QuizPage;
