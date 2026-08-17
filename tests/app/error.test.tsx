import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi, beforeEach } from "vitest";
import ErrorBoundary from "@/app/error";

/* - Mockando o router pra verificar o redirecionamento sem navegação real - */

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

/* - Limpando os mocks entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Testando o conteúdo estático - */

test("should render the error title", () => {
  render(<ErrorBoundary />);

  expect(screen.getByText("Ops.")).toBeInTheDocument();
});

test("should render the error explanation text", () => {
  render(<ErrorBoundary />);

  expect(
    screen.getByText(/Não conseguimos buscar a pergunta no banco de dados/i),
  ).toBeInTheDocument();
});

/* - Testando o botão de voltar - */

test("should navigate to the home page when the button is clicked", async () => {
  render(<ErrorBoundary />);

  const button = screen.getByText("Voltar para a página inicial");
  await userEvent.click(button);

  expect(pushMock).toHaveBeenCalledWith("/");
});
