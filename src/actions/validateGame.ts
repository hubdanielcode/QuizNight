"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const validateGame = async () => {
  const cookieStore = await cookies();
  const existingSessionId = cookieStore.get("sessionId")?.value;

  /* - Se já existe um cookie, confirma se a sessão correspondente ainda é válida - */

  if (existingSessionId) {
    const existingSession = await prisma.quizSession.findUnique({
      where: { sessionId: existingSessionId },
    });

    if (existingSession && existingSession.sessionStatus === "active") {
      return true;
    }
  }

  /* - Sem cookie, ou sessão inexistente/finalizada -> cria uma sessão nova do zero - */

  const newSession = await prisma.quizSession.create({});
  cookieStore.set("sessionId", newSession.sessionId, { httpOnly: true, maxAge: 30 * 60 });

  return true;
};

export { validateGame };
