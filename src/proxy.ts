import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function proxy(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;

  if (!sessionId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const session = await prisma.quizSession.findUnique({ where: { sessionId } });

  if (!session || session.sessionStatus !== "active") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/quiz", "/quiz/:category"],
};
