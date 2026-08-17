import { render, screen } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import QuizPage from "@/app/quiz/page";

/* - Mockando a SpinningWheel, já que ela tem lógica própria de animação/sorteio que não é relevante pra essa página - */

vi.mock("@/components/quiz/SpinningWheel", () => ({
  SpinningWheel: () => <div data-testid="spinning-wheel" />,
}));

/* - A página tem um delay proposital de 4s antes de renderizar (pra dar tempo do loading.tsx aparecer) - usando timers falsos pra não esperar isso de verdade - */

test("should render the SpinningWheel after the 4s delay", async () => {
  vi.useFakeTimers();

  const pagePromise = QuizPage();
  await vi.advanceTimersByTimeAsync(4000);
  const page = await pagePromise;

  vi.useRealTimers();

  render(page);

  expect(screen.getByTestId("spinning-wheel")).toBeInTheDocument();
});
