import { test, expect, vi, beforeEach } from "vitest";
import { validateGame } from "@/actions/validateGame";
import { prisma } from "@/lib/prisma";

/* - Mockando cookies() pra controlar o sessionId e verificar o set() sem depender de request real - */

const mockCookieGet = vi.fn();
const mockCookieSet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
    set: mockCookieSet,
  })),
}));

/* - Mockando o prisma inteiro, já que os testes não devem tocar no banco de verdade - */

vi.mock("@/lib/prisma", () => ({
  prisma: {
    quizSession: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const sessionId = "session-123";
const newSessionId = "session-456";

/* - Limpando os mocks entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Testando quando não existe cookie de sessão - */

test("should create a new session and set the cookie when there is no sessionId cookie", async () => {
  mockCookieGet.mockReturnValue(undefined);
  vi.mocked(prisma.quizSession.create).mockResolvedValue({
    sessionId: newSessionId,
  } as never);

  const result = await validateGame();

  expect(prisma.quizSession.findUnique).not.toHaveBeenCalled();
  expect(prisma.quizSession.create).toHaveBeenCalledWith({});
  expect(mockCookieSet).toHaveBeenCalledWith("sessionId", newSessionId, {
    httpOnly: true,
    maxAge: 30 * 60,
  });
  expect(result).toBe(true);
});

/* - Testando quando existe cookie e a sessão correspondente ainda está ativa - */

test("should return true without creating a new session when the existing session is active", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.quizSession.findUnique).mockResolvedValue({
    sessionId,
    sessionStatus: "active",
  } as never);

  const result = await validateGame();

  expect(prisma.quizSession.findUnique).toHaveBeenCalledWith({
    where: { sessionId },
  });
  expect(prisma.quizSession.create).not.toHaveBeenCalled();
  expect(mockCookieSet).not.toHaveBeenCalled();
  expect(result).toBe(true);
});

/* - Testando quando existe cookie, mas a sessão correspondente já foi finalizada - */

test("should create a new session and set the cookie when the existing session is finished", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.quizSession.findUnique).mockResolvedValue({
    sessionId,
    sessionStatus: "finished",
  } as never);
  vi.mocked(prisma.quizSession.create).mockResolvedValue({
    sessionId: newSessionId,
  } as never);

  const result = await validateGame();

  expect(prisma.quizSession.create).toHaveBeenCalledWith({});
  expect(mockCookieSet).toHaveBeenCalledWith("sessionId", newSessionId, {
    httpOnly: true,
    maxAge: 30 * 60,
  });
  expect(result).toBe(true);
});

/* - Testando quando existe cookie, mas a sessão correspondente não existe mais no banco - */

test("should create a new session and set the cookie when the existing session does not exist", async () => {
  mockCookieGet.mockReturnValue({ value: sessionId });
  vi.mocked(prisma.quizSession.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.quizSession.create).mockResolvedValue({
    sessionId: newSessionId,
  } as never);

  const result = await validateGame();

  expect(prisma.quizSession.create).toHaveBeenCalledWith({});
  expect(mockCookieSet).toHaveBeenCalledWith("sessionId", newSessionId, {
    httpOnly: true,
    maxAge: 30 * 60,
  });
  expect(result).toBe(true);
});
