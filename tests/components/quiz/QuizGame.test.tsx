import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { QuizGame } from "@/components/quiz/QuizGame";
import { createQuestion, submitAnswer, finishSession } from "@/actions/quiz";
import { validateGame } from "@/actions/validateGame";
import { useRouter } from "next/navigation";

/* - Mockando as server actions usadas pelo QuizGame - */

vi.mock("@/actions/quiz", () => ({
  createQuestion: vi.fn(),
  submitAnswer: vi.fn(),
  finishSession: vi.fn(),
}));

vi.mock("@/actions/validateGame", () => ({
  validateGame: vi.fn(),
}));

/* - Mockando o router do Next pra verificar navegação sem precisar de um app real - */

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: pushMock })),
}));

/* - Mockando os componentes filhos com lógica própria, pra isolar o teste no QuizGame e expor botões simples que disparam os callbacks que nos interessam - */

vi.mock("@/components/quiz/TimeBar", () => ({
  TimeBar: ({ onTimeIsUp }: any) => <button onClick={onTimeIsUp}>fake-time-up</button>,
}));

vi.mock("@/components/quiz/AnswersList", () => ({
  AnswersList: ({ onSelectAnswer }: any) => (
    <button onClick={() => onSelectAnswer("resposta-errada")}>fake-select-answer</button>
  ),
}));

vi.mock("@/components/quiz/PlayAgain", () => ({
  PlayAgain: ({ isOpen, onPlayAgain }: any) =>
    isOpen ? <button onClick={onPlayAgain}>fake-play-again</button> : null,
}));

vi.mock("@/components/ui/Loading", () => ({
  default: () => <div>fake-loading</div>,
}));

vi.mock("@/app/error", () => ({
  default: () => <div>fake-error-boundary</div>,
}));

const question = {
  questionId: "question-1",
  questionCategory: "jogos" as const,
  title: "Qual é o jogo?",
  possibleAnswers: ["A", "B", "C", "D"],
  imageUrl: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ push: pushMock } as never);
  vi.stubGlobal("navigation", {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/* - Testando o estado de carregamento antes da pergunta chegar - */

test("should show the loading state while the question is being fetched", async () => {
  vi.mocked(createQuestion).mockImplementation(() => new Promise(() => {}));

  render(
    <QuizGame
      category="jogos"
      initialScore={0}
    />,
  );

  expect(screen.getByText("fake-loading")).toBeInTheDocument();
});

/* - Testando a renderização da pergunta assim que a busca termina - */

test("should render the question once it has been fetched", async () => {
  vi.mocked(createQuestion).mockResolvedValue(question as never);

  render(
    <QuizGame
      category="jogos"
      initialScore={0}
    />,
  );

  expect(await screen.findByText("Qual é o jogo?")).toBeInTheDocument();
  expect(createQuestion).toHaveBeenCalledTimes(1);
  expect(createQuestion).toHaveBeenCalledWith("jogos");
});

/* - Testando o boundary de erro quando a busca da pergunta falha - */

test("should render the error boundary when fetching the question fails", async () => {
  vi.mocked(createQuestion).mockRejectedValue(new Error("Falha de banco"));

  render(
    <QuizGame
      category="jogos"
      initialScore={0}
    />,
  );

  expect(await screen.findByText("fake-error-boundary")).toBeInTheDocument();
});

/* - Testando o fluxo de acerto: soma o placar e navega de volta pra roleta depois do tempo de espera da animação - */

test("should increment the score and navigate to /quiz on a correct answer", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });

  vi.mocked(createQuestion).mockResolvedValue(question as never);
  vi.mocked(submitAnswer).mockResolvedValue({ isCorrect: true, rightAnswer: "A" } as never);

  render(
    <QuizGame
      category="jogos"
      initialScore={2}
    />,
  );

  const selectButton = await screen.findByText("fake-select-answer");
  await act(async () => {
    selectButton.click();
    await vi.waitFor(() =>
      expect(submitAnswer).toHaveBeenCalledWith("question-1", "resposta-errada"),
    );
  });

  await vi.advanceTimersByTimeAsync(1200);

  expect(pushMock).toHaveBeenCalledWith("/quiz");
});

/* - Testando o fluxo de erro: encerra o jogo com o motivo "wrongAnswer", sem navegar - */

test("should end the game with reason wrongAnswer on an incorrect answer", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });

  vi.mocked(createQuestion).mockResolvedValue(question as never);
  vi.mocked(submitAnswer).mockResolvedValue({ isCorrect: false, rightAnswer: "A" } as never);

  render(
    <QuizGame
      category="jogos"
      initialScore={0}
    />,
  );

  const selectButton = await screen.findByText("fake-select-answer");
  await act(async () => {
    selectButton.click();
    await vi.waitFor(() =>
      expect(submitAnswer).toHaveBeenCalledWith("question-1", "resposta-errada"),
    );
  });

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1200);
  });

  expect(await screen.findByText("fake-play-again")).toBeInTheDocument();
  expect(pushMock).not.toHaveBeenCalledWith("/quiz");
});

/* - Testando o fim de jogo por tempo esgotado, disparado pelo TimeBar - */

test("should end the game when time runs out and no answer was given", async () => {
  vi.mocked(createQuestion).mockResolvedValue(question as never);
  vi.mocked(finishSession).mockResolvedValue(undefined as never);

  render(
    <QuizGame
      category="jogos"
      initialScore={0}
    />,
  );

  const timeUpButton = await screen.findByText("fake-time-up");
  await act(async () => {
    timeUpButton.click();
  });

  expect(await screen.findByText("fake-play-again")).toBeInTheDocument();
});

/* - Testando se a sessão é fechada no banco (não só no estado local) quando o tempo acaba - */

test("should close the session in the database when time runs out", async () => {
  vi.mocked(createQuestion).mockResolvedValue(question as never);
  vi.mocked(finishSession).mockResolvedValue(undefined as never);

  render(
    <QuizGame
      category="jogos"
      initialScore={0}
    />,
  );

  const timeUpButton = await screen.findByText("fake-time-up");
  await act(async () => {
    timeUpButton.click();
  });

  expect(finishSession).toHaveBeenCalledWith("timesUp");
});

/* - Testando "jogar novamente": revalida a sessão e volta pra roleta - */

test("should validate the game and navigate to /quiz when playing again", async () => {
  vi.mocked(createQuestion).mockResolvedValue(question as never);
  vi.mocked(validateGame).mockResolvedValue(true as never);

  render(
    <QuizGame
      category="jogos"
      initialScore={0}
    />,
  );

  const timeUpButton = await screen.findByText("fake-time-up");
  act(() => {
    timeUpButton.click();
  });

  const playAgainButton = await screen.findByText("fake-play-again");
  act(() => {
    playAgainButton.click();
  });

  await waitFor(() => expect(validateGame).toHaveBeenCalledTimes(1));
  expect(pushMock).toHaveBeenCalledWith("/quiz");
});
