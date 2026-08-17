import { test, expect, vi, beforeEach } from "vitest";
import { submitAnswer, finishSession } from "@/actions/quiz";
import { prisma } from "@/lib/prisma";

/* - Capturando o callback passado pro after() em vez de deixar ele rodar de verdade,
     pra poder testar a resposta imediata e o efeito em background separadamente - */

let capturedAfterCallback: (() => Promise<void>) | null = null;

vi.mock("next/server", () => ({
  after: vi.fn((callback: () => Promise<void>) => {
    capturedAfterCallback = callback;
  }),
}));

/* - Mockando cookies() pra controlar o sessionId sem depender de request real - */

const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}));

/* - Mockando o prisma inteiro, já que os testes não devem tocar no banco de verdade - */

vi.mock("@/lib/prisma", () => ({
  prisma: {
    question: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    quizSession: {
      update: vi.fn(),
    },
  },
}));

const sessionId = "session-123";
const questionId = "question-123";

/* - Limpando os mocks e o callback capturado entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
  capturedAfterCallback = null;
});

/* - Testando a validação do payload - */

test("should throw an error when questionId or selectedAnswer is missing", async () => {
  await expect(
    submitAnswer(undefined as unknown as string, undefined as unknown as string),
  ).rejects.toThrow("Payload de resposta inválido.");
});

/* - Testando a ausência de sessão - */

test("should throw an error when there is no sessionId cookie", async () => {
  mockCookieGet.mockReturnValue(undefined);

  await expect(submitAnswer(questionId, "resposta")).rejects.toThrow("Sessão não encontrada.");
});

/* - Testando pergunta inexistente ou de outra sessão - */

test("should throw an error when the question does not exist", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.question.findUnique).mockResolvedValue(null);

  await expect(submitAnswer(questionId, "resposta")).rejects.toThrow(
    "Erro ao buscar qual pergunta foi respondida.",
  );
});

test("should throw an error when the question belongs to another session", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.question.findUnique).mockResolvedValue({
    questionId: questionId,
    sessionId: "outra-sessao",
    rightAnswer: "certa",
  } as never);

  await expect(submitAnswer(questionId, "resposta")).rejects.toThrow(
    "Erro ao buscar qual pergunta foi respondida.",
  );
});

/* - Testando o resultado retornado pro client (acerto e erro) - */

test("should return isCorrect: true when the selected answer matches rightAnswer", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.question.findUnique).mockResolvedValue({
    questionId: questionId,
    sessionId,
    rightAnswer: "resposta-certa",
  } as never);

  const result = await submitAnswer(questionId, "resposta-certa");

  expect(result).toEqual({ isCorrect: true, rightAnswer: "resposta-certa" });
});

test("should return isCorrect: false when the selected answer does not match rightAnswer", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.question.findUnique).mockResolvedValue({
    questionId: questionId,
    sessionId,
    rightAnswer: "resposta-certa",
  } as never);

  const result = await submitAnswer(questionId, "resposta-errada");

  expect(result).toEqual({ isCorrect: false, rightAnswer: "resposta-certa" });
});

/* - Testando se o after() realmente adia as escritas, sem travar a resposta - */

test("should not write to the database before returning the response", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.question.findUnique).mockResolvedValue({
    questionId: questionId,
    sessionId,
    rightAnswer: "resposta-certa",
  } as never);

  await submitAnswer(questionId, "resposta-certa");

  expect(prisma.question.update).not.toHaveBeenCalled();
  expect(prisma.quizSession.update).not.toHaveBeenCalled();
  expect(capturedAfterCallback).not.toBeNull();
});

/* - Testando o efeito do callback do after() quando ele roda, no acerto e no erro - */

test("should save selectedAnswer and increment score when after() callback runs on a correct answer", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.question.findUnique).mockResolvedValue({
    questionId: questionId,
    sessionId,
    rightAnswer: "resposta-certa",
  } as never);

  await submitAnswer(questionId, "resposta-certa");
  await capturedAfterCallback?.();

  expect(prisma.question.update).toHaveBeenCalledWith({
    where: { questionId: questionId },
    data: { selectedAnswer: "resposta-certa" },
  });
  expect(prisma.quizSession.update).toHaveBeenCalledWith({
    where: { sessionId },
    data: { score: { increment: 1 } },
  });
});

test("should save selectedAnswer and finish the session when after() callback runs on a wrong answer", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.question.findUnique).mockResolvedValue({
    questionId: questionId,
    sessionId,
    rightAnswer: "resposta-certa",
  } as never);

  await submitAnswer(questionId, "resposta-errada");
  await capturedAfterCallback?.();

  expect(prisma.question.update).toHaveBeenCalledWith({
    where: { questionId: questionId },
    data: { selectedAnswer: "resposta-errada" },
  });
  expect(prisma.quizSession.update).toHaveBeenCalledWith({
    where: { sessionId },
    data: { sessionStatus: "finished", reasonWhyGameEnded: "wrongAnswer" },
  });
});

/* - Testando se um erro dentro do after() é capturado e não vaza - */

test("should catch and log an error thrown inside the after() callback", async () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.question.findUnique).mockResolvedValue({
    questionId: questionId,
    sessionId,
    rightAnswer: "resposta-certa",
  } as never);
  vi.mocked(prisma.question.update).mockRejectedValue(new Error("Falha de banco"));

  await submitAnswer(questionId, "resposta-certa");

  await expect(capturedAfterCallback?.()).resolves.not.toThrow();
  expect(consoleSpy).toHaveBeenCalled();

  consoleSpy.mockRestore();
});

/* - Testando finishSession: fecha a sessão no banco quando o tempo acaba - */

test("should do nothing when there is no sessionId cookie", async () => {
  mockCookieGet.mockReturnValue(undefined);

  await finishSession("timesUp");

  expect(prisma.quizSession.update).not.toHaveBeenCalled();
});

test("should mark the session as finished with the given reason", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });

  await finishSession("timesUp");

  expect(prisma.quizSession.update).toHaveBeenCalledWith({
    where: { sessionId },
    data: { sessionStatus: "finished", reasonWhyGameEnded: "timesUp" },
  });
});

test("should catch and log an error when updating the session fails", async () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.quizSession.update).mockRejectedValue(new Error("Falha de banco"));

  await expect(finishSession("timesUp")).resolves.not.toThrow();
  expect(consoleSpy).toHaveBeenCalled();

  consoleSpy.mockRestore();
});
