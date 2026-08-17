import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BonusCategoryModal } from "@/components/quiz/BonusCategoryModal";
import { useRouter } from "next/navigation";

/* - Mockando o router do Next, já que o BonusCategoryModal renderiza o RedirectToHome
     internamente, e o RedirectToHome usa useRouter() - */

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}));

/* - Mockando o CategoryOptionButton pra isolar o teste na lógica do próprio BonusCategoryModal (o que ele renderiza pra cada categoria, não como o botão filho se comporta - isso já é testado em CategoryOptionsButton.test.tsx) - */

vi.mock("@/components/ui/CategoryOptionsButton", () => ({
  CategoryOptionButton: ({ category }: any) => (
    <button data-testid={`category-${category.id}`}>{category.label}</button>
  ),
}));

/* - Testando o título fixo do modal - */

test("should render the modal title", () => {
  render(<BonusCategoryModal />);

  expect(screen.getByText("Escolha a Categoria")).toBeInTheDocument();
});

/* - Testando se a categoria "bonus" é excluída da lista (não faz sentido oferecer bônus dentro do próprio modal de bônus) - */

test("should not render the bonus category as an option", () => {
  render(<BonusCategoryModal />);

  expect(screen.queryByTestId("category-bonus")).not.toBeInTheDocument();
});

/* - Testando se as demais categorias (filmes, jogos, músicas) aparecem - */

test("should render every category except bonus", () => {
  render(<BonusCategoryModal />);

  expect(screen.getByTestId("category-filmes")).toBeInTheDocument();
  expect(screen.getByTestId("category-jogos")).toBeInTheDocument();
  expect(screen.getByTestId("category-musicas")).toBeInTheDocument();
});
