import { test, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { proxy, config } from "@/proxy";
import { prisma } from "@/lib/prisma";

/* - Mockando o prisma, já que o proxy não deve tocar no banco de verdade - */

vi.mock("@/lib/prisma", () => ({
  prisma: {
    quizSession: {
      findUnique: vi.fn(),
    },
  },
}));

/* - Construindo uma NextRequest com (ou sem) o cookie de sessionId, sem precisar
     de um servidor real - */

const buildRequest = (sessionId?: string) => {
  const request = new NextRequest(new URL("https://quiznight.app/quiz"));
  if (sessionId) {
    request.cookies.set("sessionId", sessionId);
  }
  return request;
};

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Testando o redirecionamento quando não existe cookie de sessão - */

test("should redirect to home when there is no sessionId cookie", async () => {
  const response = await proxy(buildRequest());

  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("https://quiznight.app/");
  expect(prisma.quizSession.findUnique).not.toHaveBeenCalled();
});

/* - Testando o redirecionamento quando a sessão não existe no banco - */

test("should redirect to home when the session does not exist", async () => {
  vi.mocked(prisma.quizSession.findUnique).mockResolvedValue(null);

  const response = await proxy(buildRequest("session-123"));

  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("https://quiznight.app/");
});

/* - Testando o redirecionamento quando a sessão existe mas já foi encerrada - */

test("should redirect to home when the session is no longer active", async () => {
  vi.mocked(prisma.quizSession.findUnique).mockResolvedValue({
    sessionId: "session-123",
    sessionStatus: "finished",
  } as never);

  const response = await proxy(buildRequest("session-123"));

  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("https://quiznight.app/");
});

/* - Testando se a busca no banco usa o sessionId certo, vindo do cookie - */

test("should look up the session using the sessionId from the cookie", async () => {
  vi.mocked(prisma.quizSession.findUnique).mockResolvedValue({
    sessionId: "session-123",
    sessionStatus: "active",
  } as never);

  await proxy(buildRequest("session-123"));

  expect(prisma.quizSession.findUnique).toHaveBeenCalledWith({
    where: { sessionId: "session-123" },
  });
});

/* - Testando se a requisição segue normalmente quando a sessão existe e está ativa - */

test("should allow the request through when the session is active", async () => {
  vi.mocked(prisma.quizSession.findUnique).mockResolvedValue({
    sessionId: "session-123",
    sessionStatus: "active",
  } as never);

  const response = await proxy(buildRequest("session-123"));

  // NextResponse.next() não é um redirect: não tem "location" e não é 307/308
  expect(response.headers.get("location")).toBeNull();
});

/* - Testando o matcher: confirma quais rotas o proxy deve interceptar - */

test("should only match the quiz routes", () => {
  expect(config.matcher).toEqual(["/quiz", "/quiz/:category"]);
});
