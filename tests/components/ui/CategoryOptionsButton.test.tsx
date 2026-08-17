import { test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryOptionButton } from "@/components/ui/CategoryOptionsButton";
import { categories } from "@/types/categories";
import { useRouter } from "next/navigation";

/* - Mockando "motion/react" pra virar um botão comum - */

vi.mock("motion/react", () => ({
  motion: {
    button: ({ children, whileHover, whileTap, ...rest }: any) => (
      <button {...rest}>{children}</button>
    ),
  },
}));

/* - Mockando o router do Next pra verificar a navegação - */

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: pushMock })),
}));

const [, filmesCategory] = categories;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ push: pushMock } as never);
});

/* - Testando a renderização do rótulo da categoria - */

test("should render the category label", () => {
  render(<CategoryOptionButton category={filmesCategory} />);

  expect(screen.getByText(filmesCategory.label)).toBeInTheDocument();
});

/* - Testando se clicar navega pra rota correspondente àquela categoria - */

test("should navigate to the category route when clicked", async () => {
  const user = userEvent.setup();

  render(<CategoryOptionButton category={filmesCategory} />);

  await user.click(screen.getByText(filmesCategory.label));

  expect(pushMock).toHaveBeenCalledWith(`/quiz/${filmesCategory.id}`);
});

/* - Testando com uma categoria diferente, pra confirmar que a rota muda de acordo com a categoria recebida via props - */

test("should navigate to a different route for a different category", async () => {
  const user = userEvent.setup();
  const [, , jogosCategory] = categories;

  render(<CategoryOptionButton category={jogosCategory} />);

  await user.click(screen.getByText(jogosCategory.label));

  expect(pushMock).toHaveBeenCalledWith(`/quiz/${jogosCategory.id}`);
});
