import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Cards } from "@/components/ui/Cards";
import { homeCards, errorCards } from "@/types/cards";

/* - Componente sem branch/decisão, só mapeia o array recebido: teste simples de renderização confirmando o que aparece na tela pra cada card - */

test("should render one item per card with its text", () => {
  render(<Cards cards={homeCards} />);

  homeCards.forEach((card) => {
    expect(screen.getByText(card.text)).toBeInTheDocument();
  });

  expect(screen.getAllByRole("listitem")).toHaveLength(homeCards.length);
});

/* - Testando com outra lista de cards, pra confirmar que o componente é genérico e não está amarrado a um conjunto fixo - */

test("should render a different set of cards correctly", () => {
  render(<Cards cards={errorCards} />);

  errorCards.forEach((card) => {
    expect(screen.getByText(card.text)).toBeInTheDocument();
  });

  expect(screen.getAllByRole("listitem")).toHaveLength(errorCards.length);
});

/* - Testando a lista vazia (nenhum card pra renderizar) - */

test("should render no items when the cards array is empty", () => {
  render(<Cards cards={[]} />);

  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});
