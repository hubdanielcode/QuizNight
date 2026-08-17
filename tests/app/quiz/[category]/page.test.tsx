import { render, screen } from "@testing-library/react";
import { test, expect, vi, beforeEach } from "vitest";
import QuestionPage from "@/app/quiz/[category]/page";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/* - Mockando cookies() pra controlar o sessionId sem depender de request real - */

const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: mockCookieGet })),
}));

/* - Mockando redirect() com o mesmo comportamento do Next real: ele interrompe
     a execução lançando um erro, em vez de simplesmente retornar - */

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

/* - Mockando o prisma inteiro, já que os testes não devem tocar no banco de verdade - */

vi.mock("@/lib/prisma", () => ({
  prisma: {
    quizSession: {
      findUnique: vi.fn(),
    },
  },
}));

/* - Mockando BonusCategoryModal e QuizGame, já que a lógica deles é testada
     separadamente em components/quiz - aqui só importa qual foi renderizado e com quais props - */

vi.mock("@/components/quiz/BonusCategoryModal", () => ({
  BonusCategoryModal: () => <div data-testid="bonus-modal" />,
}));

vi.mock("@/components/quiz/QuizGame", () => ({
  QuizGame: ({ category, initialScore }: { category: string; initialScore: number }) => (
    <div data-testid="quiz-game">
      {category} - {initialScore}
    </div>
  ),
}));

const sessionId = "session-123";

/* - Limpando os mocks entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Testando categoria de bônus (fora das três categorias normais) - */

test("should render BonusCategoryModal when the category is not jogos/filmes/musicas", async () => {
  const page = await QuestionPage({ params: Promise.resolve({ category: "bonus" }) });
  render(page);

  expect(screen.getByTestId("bonus-modal")).toBeInTheDocument();
});

/* - Testando ausência de sessão - */

test("should render QuizGame with initialScore 0 when there is no sessionId cookie", async () => {
  mockCookieGet.mockReturnValue(undefined);

  const page = await QuestionPage({ params: Promise.resolve({ category: "jogos" }) });
  render(page);

  expect(prisma.quizSession.findUnique).not.toHaveBeenCalled();
  expect(screen.getByText("jogos - 0")).toBeInTheDocument();
});

/* - Testando sessão ativa - */

test("should render QuizGame with the session's score when the session is active", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.quizSession.findUnique).mockResolvedValue({
    sessionId,
    sessionStatus: "active",
    score: 3,
  } as never);

  const page = await QuestionPage({ params: Promise.resolve({ category: "filmes" }) });
  render(page);

  expect(screen.getByText("filmes - 3")).toBeInTheDocument();
});

/* - Testando sessão finalizada - */

test("should redirect to the home page when the session is finished", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.quizSession.findUnique).mockResolvedValue({
    sessionId,
    sessionStatus: "finished",
    score: 3,
  } as never);

  await expect(QuestionPage({ params: Promise.resolve({ category: "filmes" }) })).rejects.toThrow(
    "NEXT_REDIRECT",
  );

  expect(redirect).toHaveBeenCalledWith("/");
});

/* - Testando sessão inexistente no banco - */

test("should redirect to the home page when the session does not exist", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.quizSession.findUnique).mockResolvedValue(null);

  await expect(QuestionPage({ params: Promise.resolve({ category: "filmes" }) })).rejects.toThrow(
    "NEXT_REDIRECT",
  );

  expect(redirect).toHaveBeenCalledWith("/");
});
