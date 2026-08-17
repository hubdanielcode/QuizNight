import { render, screen } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import Home from "@/app/page";

/* - Mockando a SpinningWheel, já que ela tem lógica própria de animação/sorteio
     que não é relevante pra essa página - */

vi.mock("@/components/quiz/SpinningWheel", () => ({
  SpinningWheel: () => <div data-testid="spinning-wheel" />,
}));

/* - Mockando o router, já que o Button usado nessa página chama useRouter() internamente - */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

/* - Testando o conteúdo principal - */

test("should render the main heading", () => {
  render(<Home />);

  expect(screen.getByText("Gire a roleta.")).toBeInTheDocument();
});

test("should render the play button", () => {
  render(<Home />);

  expect(screen.getByText("Jogar Agora")).toBeInTheDocument();
});

/* - Testando a roleta - */

test("should render the SpinningWheel", () => {
  render(<Home />);

  expect(screen.getByTestId("spinning-wheel")).toBeInTheDocument();
});
