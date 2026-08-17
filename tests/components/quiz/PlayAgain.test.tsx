import { test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayAgain } from "@/components/quiz/PlayAgain";

/* - Mockando "motion/react" pra virar elementos comuns, já que AnimatePresence e as transições de entrada/saída não são o que estamos testando aqui - */

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, initial, animate, exit, transition, ...rest }: any) => (
      <div {...rest}>{children}</div>
    ),
    button: ({ children, whileHover, whileTap, ...rest }: any) => (
      <button {...rest}>{children}</button>
    ),
  },
}));

const onPlayAgain = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Testando que nada é renderizado quando o jogo ainda não acabou - */

test("should render nothing when gameEnded is null", () => {
  const { container } = render(
    <PlayAgain
      isOpen
      gameEnded={null}
      onPlayAgain={onPlayAgain}
    />,
  );

  expect(container).toBeEmptyDOMElement();
});

/* - Testando que nada é renderizado quando o modal está fechado, mesmo com o jogo encerrado - */

test("should render nothing when isOpen is false", () => {
  render(
    <PlayAgain
      isOpen={false}
      gameEnded="wrongAnswer"
      onPlayAgain={onPlayAgain}
    />,
  );

  expect(screen.queryByText("Jogar Novamente")).not.toBeInTheDocument();
});

/* - Testando o título mostrado pra cada motivo do fim de jogo - */

test("should show 'Tempo Esgotado' when gameEnded is timesUp", () => {
  render(
    <PlayAgain
      isOpen
      gameEnded="timesUp"
      onPlayAgain={onPlayAgain}
    />,
  );

  expect(screen.getByText("Tempo Esgotado")).toBeInTheDocument();
});

test("should show 'Você Errou' when gameEnded is wrongAnswer", () => {
  render(
    <PlayAgain
      isOpen
      gameEnded="wrongAnswer"
      onPlayAgain={onPlayAgain}
    />,
  );

  expect(screen.getByText("Você Errou")).toBeInTheDocument();
});

/* - Testando a exibição condicional da pontuação - */

test("should show the score when it is provided", () => {
  render(
    <PlayAgain
      isOpen
      score={7}
      gameEnded="wrongAnswer"
      onPlayAgain={onPlayAgain}
    />,
  );

  expect(screen.getByText("7")).toBeInTheDocument();
});

test("should not show a score section when score is not provided", () => {
  render(
    <PlayAgain
      isOpen
      gameEnded="wrongAnswer"
      onPlayAgain={onPlayAgain}
    />,
  );

  expect(screen.queryByText(/Sua Pontuação/)).not.toBeInTheDocument();
});

/* - Testando se clicar em "Jogar Novamente" dispara o callback - */

test("should call onPlayAgain when the button is clicked", async () => {
  const user = userEvent.setup();

  render(
    <PlayAgain
      isOpen
      gameEnded="timesUp"
      onPlayAgain={onPlayAgain}
    />,
  );

  await user.click(screen.getByText("Jogar Novamente"));

  expect(onPlayAgain).toHaveBeenCalledTimes(1);
});
