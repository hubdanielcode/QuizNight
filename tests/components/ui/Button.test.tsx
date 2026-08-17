import { test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";
import { validateGame } from "@/actions/validateGame";
import { useRouter } from "next/navigation";

/* - Mockando "motion/react" pra virar um botão comum - */

vi.mock("motion/react", () => ({
  motion: {
    button: ({ children, whileHover, whileTap, ...rest }: any) => (
      <button {...rest}>{children}</button>
    ),
  },
}));

/* - Mockando a server action e o router - */

vi.mock("@/actions/validateGame", () => ({
  validateGame: vi.fn(),
}));

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: pushMock })),
}));

const onClick = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ push: pushMock } as never);
});

/* - Testando a renderização do texto do botão - */

test("should render the provided text", () => {
  render(<Button text="Girar Roleta" />);

  expect(screen.getByText("Girar Roleta")).toBeInTheDocument();
});

/* - Testando que, quando um onClick é passado, ele é chamado no lugar do fluxo padrão (não valida sessão nem navega) - */

test("should call the provided onClick instead of the default flow", async () => {
  const user = userEvent.setup();

  render(
    <Button
      text="Girar Roleta"
      onClick={onClick}
    />,
  );

  await user.click(screen.getByText("Girar Roleta"));

  expect(onClick).toHaveBeenCalledTimes(1);
  expect(validateGame).not.toHaveBeenCalled();
  expect(pushMock).not.toHaveBeenCalled();
});

/* - Testando o fluxo padrão: sem onClick, valida a sessão e navega pra /quiz - */

test("should validate the game and navigate to /quiz when no onClick is provided", async () => {
  vi.mocked(validateGame).mockResolvedValue(true as never);
  const user = userEvent.setup();

  render(<Button text="Jogar" />);

  await user.click(screen.getByText("Jogar"));

  expect(validateGame).toHaveBeenCalledTimes(1);
  expect(pushMock).toHaveBeenCalledWith("/quiz");
});

/* - Testando a propagação do estado desabilitado - */

test("should render as disabled when the disabled prop is true", () => {
  render(
    <Button
      text="Jogar"
      disabled
    />,
  );

  expect(screen.getByText("Jogar")).toBeDisabled();
});
