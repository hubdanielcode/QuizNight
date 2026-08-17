import { test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnswersList } from "@/components/quiz/AnswersList";

/* - Mockando "motion/react" pra virar elementos comuns, já que a animação em si não é o que estamos testando aqui - */

vi.mock("motion/react", () => ({
  motion: {
    button: ({ children, whileHover, whileTap, ...rest }: any) => (
      <button {...rest}>{children}</button>
    ),
  },
}));

const possibleAnswers = ["Resposta A", "Resposta B", "Resposta C", "Resposta D"];
const onSelectAnswer = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Testando a renderização de todas as alternativas - */

test("should render all possible answers", () => {
  render(
    <AnswersList
      possibleAnswers={possibleAnswers}
      submitAnswerResult={null}
      onSelectAnswer={onSelectAnswer}
    />,
  );

  possibleAnswers.forEach((answer) => {
    expect(screen.getByText(answer)).toBeInTheDocument();
  });
});

/* - Testando se clicar numa resposta dispara o callback com o valor certo - */

test("should call onSelectAnswer with the clicked answer", async () => {
  const user = userEvent.setup();

  render(
    <AnswersList
      possibleAnswers={possibleAnswers}
      submitAnswerResult={null}
      onSelectAnswer={onSelectAnswer}
    />,
  );

  await user.click(screen.getByText("Resposta B"));

  expect(onSelectAnswer).toHaveBeenCalledTimes(1);
  expect(onSelectAnswer).toHaveBeenCalledWith("Resposta B");
});

/* - Testando se, depois de escolher uma resposta, todos os botões ficam travados (o componente ignora novos cliques e não dispara o callback de novo) - */

test("should lock the answer after the first selection", async () => {
  const user = userEvent.setup();

  render(
    <AnswersList
      possibleAnswers={possibleAnswers}
      submitAnswerResult={null}
      onSelectAnswer={onSelectAnswer}
    />,
  );

  await user.click(screen.getByText("Resposta A"));
  await user.click(screen.getByText("Resposta B"));

  expect(onSelectAnswer).toHaveBeenCalledTimes(1);
  expect(onSelectAnswer).toHaveBeenCalledWith("Resposta A");

  possibleAnswers.forEach((answer) => {
    expect(screen.getByText(answer).closest("button")).toBeDisabled();
  });
});

/* - Testando o feedback visual quando o resultado já veio do servidor: ícone de certo na resposta certa, ícone de errado na escolhida errada - */

test("should show the check icon on the right answer and the X icon on a wrong chosen answer", () => {
  const { container } = render(
    <AnswersList
      possibleAnswers={possibleAnswers}
      submitAnswerResult={{ isCorrect: false, rightAnswer: "Resposta C" }}
      onSelectAnswer={onSelectAnswer}
    />,
  );

  const rightAnswerButton = screen.getByText("Resposta C").closest("button");
  expect(rightAnswerButton?.querySelector("svg.lucide-check")).toBeInTheDocument();

  /* - Como nenhuma resposta foi de fato "clicada" neste teste (chosenAnswer é interno e começa nulo), nenhum X deve aparecer - garante que o ícone de erro só some quando a resposta errada corresponde à escolhida pelo usuário. - */
  expect(container.querySelector("svg.lucide-x")).not.toBeInTheDocument();
});
