import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import Loading from "@/components/ui/Loading";

/* - Mockando "motion/react" pra virar elementos comuns, expondo o "animate" (que controla a opacidade de cada ponto) como atributo inspecionável - */

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
    span: ({ children, animate, ...rest }: any) => (
      <span
        data-opacity={animate?.opacity}
        {...rest}
      >
        {children}
      </span>
    ),
  },
}));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando o texto fixo de carregamento - */

test("should render the loading text", () => {
  render(<Loading />);

  expect(screen.getByText("Carregando")).toBeInTheDocument();
});

/* - Testando o estado inicial dos pontos: nenhum visível ainda (currentStep = 0) - */

test("should start with all dots hidden", () => {
  render(<Loading />);

  const dots = screen.getAllByText(".");
  dots.forEach((dot) => {
    expect(dot).toHaveAttribute("data-opacity", "0");
  });
});

/* - Testando se os pontos vão acendendo um a um a cada 400ms - */

test("should reveal one more dot every 400ms", () => {
  render(<Loading />);

  const dots = screen.getAllByText(".");

  act(() => {
    vi.advanceTimersByTime(400);
  });
  expect(dots[0]).toHaveAttribute("data-opacity", "1");
  expect(dots[1]).toHaveAttribute("data-opacity", "0");
  expect(dots[2]).toHaveAttribute("data-opacity", "0");

  act(() => {
    vi.advanceTimersByTime(400);
  });
  expect(dots[1]).toHaveAttribute("data-opacity", "1");

  act(() => {
    vi.advanceTimersByTime(400);
  });
  expect(dots[2]).toHaveAttribute("data-opacity", "1");
});

/* - Testando se o ciclo reinicia depois do quarto passo (currentStep vai de 0 a 3 e volta pra 0, já que o módulo é por 4) - */

test("should restart the cycle after the fourth step", () => {
  render(<Loading />);

  const dots = screen.getAllByText(".");

  act(() => {
    vi.advanceTimersByTime(400 * 4);
  });

  dots.forEach((dot) => {
    expect(dot).toHaveAttribute("data-opacity", "0");
  });
});

/* - Testando se o intervalo é limpo ao desmontar o componente (não deve continuar rodando e causando efeitos colaterais depois que a tela sai) - */

test("should clear the interval on unmount", () => {
  const clearIntervalSpy = vi.spyOn(global, "clearInterval");

  const { unmount } = render(<Loading />);
  unmount();

  expect(clearIntervalSpy).toHaveBeenCalled();
});
