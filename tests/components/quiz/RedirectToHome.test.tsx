import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { RedirectToHome, BlockBrowserNavigation } from "@/components/quiz/RedirectToHome";
import { useRouter } from "next/navigation";

/* - Mockando o router do Next pra verificar se o replace é chamado - */

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ replace: replaceMock })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ replace: replaceMock } as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* - Testando o redirecionamento quando a página foi carregada por reload - */

test("should redirect to home when the page was loaded via a reload", () => {
  vi.spyOn(performance, "getEntriesByType").mockReturnValue([
    { type: "reload" } as PerformanceNavigationTiming,
  ]);

  render(<RedirectToHome />);

  expect(replaceMock).toHaveBeenCalledWith("/");
});

/* - Testando se nada acontece quando a navegação não foi um reload (ex: o usuário chegou clicando num link) - */

test("should not redirect when the page was not loaded via a reload", () => {
  vi.spyOn(performance, "getEntriesByType").mockReturnValue([
    { type: "navigate" } as PerformanceNavigationTiming,
  ]);

  render(<RedirectToHome />);

  expect(replaceMock).not.toHaveBeenCalled();
});

/* - Testando se o componente quebra quando não há entradas de navegação disponíveis (performance.getEntriesByType retorna vazio) - */

test("should not throw and not redirect when there is no navigation entry", () => {
  vi.spyOn(performance, "getEntriesByType").mockReturnValue([]);

  expect(() => render(<RedirectToHome />)).not.toThrow();
  expect(replaceMock).not.toHaveBeenCalled();
});

/* - Testando se o componente não renderiza nenhum elemento visível - */

test("should not render any visible content", () => {
  vi.spyOn(performance, "getEntriesByType").mockReturnValue([]);

  const { container } = render(<RedirectToHome />);

  expect(container).toBeEmptyDOMElement();
});

/* - Testando se uma entrada extra é empilhada no histórico assim que o componente monta - */

test("should push an extra history entry on mount", () => {
  const pushStateSpy = vi.spyOn(window.history, "pushState");

  render(<BlockBrowserNavigation />);

  expect(pushStateSpy).toHaveBeenCalledWith(null, "", window.location.href);
});

/* - Testando se voltar/avançar (popstate) manda o usuário pra home - */

test("should redirect to home when the user tries to go back or forward", () => {
  render(<BlockBrowserNavigation />);

  window.dispatchEvent(new PopStateEvent("popstate"));

  expect(replaceMock).toHaveBeenCalledWith("/");
});

/* - Testando se a armadilha continua ativa: cada tentativa de voltar reempilha uma nova entrada - */

test("should keep re-pushing history entries on every navigation attempt", () => {
  const pushStateSpy = vi.spyOn(window.history, "pushState");

  render(<BlockBrowserNavigation />);

  const callsAfterMount = pushStateSpy.mock.calls.length;

  window.dispatchEvent(new PopStateEvent("popstate"));
  window.dispatchEvent(new PopStateEvent("popstate"));

  expect(pushStateSpy.mock.calls.length).toBe(callsAfterMount + 2);
});

/* - Testando se o listener de popstate é removido quando o componente desmonta - */

test("should remove the popstate listener on unmount", () => {
  const { unmount } = render(<BlockBrowserNavigation />);

  unmount();
  replaceMock.mockClear();

  window.dispatchEvent(new PopStateEvent("popstate"));

  expect(replaceMock).not.toHaveBeenCalled();
});

/* - Testando se o componente não renderiza nenhum elemento visível - */

test("should not render any visible content", () => {
  const { container } = render(<BlockBrowserNavigation />);

  expect(container).toBeEmptyDOMElement();
});
