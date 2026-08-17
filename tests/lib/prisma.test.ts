import { test, expect, vi, beforeEach, afterEach } from "vitest";

/* - Mockando o PrismaClient e o adapter do Postgres, já que este arquivo só instancia os dois - não há nenhuma decisão/branch pra testar aqui, só a composição correta (adapter criado com a connection string certa e passado pro client). Ambos são instanciados com "new", então capturamos os argumentos recebidos por cada construtor mockado - */

const adapterConstructorCalls: unknown[][] = [];
const clientConstructorCalls: unknown[][] = [];

class FakePrismaPg {
  constructor(...args: unknown[]) {
    adapterConstructorCalls.push(args);
  }
}

class FakePrismaClient {
  constructor(...args: unknown[]) {
    clientConstructorCalls.push(args);
  }
}

vi.mock("@/prisma/generated/prisma/client", () => ({
  PrismaClient: FakePrismaClient,
}));

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: FakePrismaPg,
}));

beforeEach(() => {
  vi.resetModules();
  adapterConstructorCalls.length = 0;
  clientConstructorCalls.length = 0;
  vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/quiznight");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

/* - Testando se o adapter é criado com a connection string vinda do ambiente - */

test("should create the Postgres adapter with the DATABASE_URL connection string", async () => {
  await import("@/lib/prisma");

  expect(adapterConstructorCalls[0][0]).toEqual({
    connectionString: "postgresql://user:pass@localhost:5432/quiznight",
  });
});

/* - Testando se o client é instanciado usando o adapter criado (a mesma instância que o construtor do adapter gerou) - */

test("should instantiate the client with the created adapter", async () => {
  await import("@/lib/prisma");

  const adapterInstance = clientConstructorCalls[0][0] as { adapter: unknown };
  expect(adapterInstance.adapter).toBeInstanceOf(FakePrismaPg);
});

/* - Testando se o módulo exporta uma instância do client - */

test("should export a prisma client instance", async () => {
  const { prisma } = await import("@/lib/prisma");

  expect(prisma).toBeInstanceOf(FakePrismaClient);
});
