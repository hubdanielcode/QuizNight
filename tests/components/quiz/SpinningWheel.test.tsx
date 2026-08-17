import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpinningWheel } from "@/components/quiz/SpinningWheel";
import { getWheelSlices } from "@/lib/getWheelSlices";
import { useRouter } from "next/navigation";

/* - Mockando o router do Next pra verificar a navegação sem precisar de um app real - */

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: pushMock })),
}));

/* - Mockando as fatias da roleta com valores determinísticos, pra não depender do cálculo geométrico real (isso já é coberto por um eventual teste de getWheelSlices.ts) - */

vi.mock("@/lib/getWheelSlices", () => ({
  getWheelSlices: vi.fn(),
}));

/* - Mockando o Button pra isolar o teste no SpinningWheel - */

vi.mock("@/components/ui/Button", () => ({
  Button: ({ text, onClick, disabled }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  ),
}));

const jogosSlice = {
  category: { id: "jogos", label: "Jogos", icon: () => null, iconColor: "#fff", color: "#fff" },
  sliceAngle: 360,
  startingAngle: 0,
  middleAngle: 180,
  endingAngle: 360,
  path: "M",
  iconX: 50,
  iconY: 50,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ push: pushMock } as never);
  vi.mocked(getWheelSlices).mockReturnValue([jogosSlice] as never);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/* - Testando que o botão de girar só aparece quando showButton é true - */

test("should not render the spin button when showButton is false", () => {
  render(<SpinningWheel showButton={false} />);

  expect(screen.queryByText("Girar Roleta")).not.toBeInTheDocument();
});

test("should render the spin button when showButton is true", () => {
  render(<SpinningWheel showButton />);

  expect(screen.getByText("Girar Roleta")).toBeInTheDocument();
});

/* - Testando que o botão fica desabilitado assim que a roleta começa a girar - */

test("should disable the spin button while the wheel is spinning", async () => {
  const user = userEvent.setup();

  render(<SpinningWheel showButton />);

  const button = screen.getByText("Girar Roleta");
  await user.click(button);

  expect(button).toBeDisabled();
});

/* - Testando o fluxo completo: depois de girar, navega pra categoria sorteada assim que os 7.5s da animação passam - */

test("should navigate to the landed category after the spin animation ends", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.spyOn(Math, "random").mockReturnValue(0);

  render(<SpinningWheel showButton />);

  const button = screen.getByText("Girar Roleta");

  const user = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime,
  });
  await user.click(button);

  await vi.advanceTimersByTimeAsync(7500);

  expect(pushMock).toHaveBeenCalledWith("/quiz/jogos");
});

/* - Testando o caso de borda em que nenhuma fatia corresponde ao ângulo sorteado: loga o erro e não navega - */

test("should log an error and not navigate when no slice matches the drawn angle", async () => {
  vi.mocked(getWheelSlices).mockReturnValue([]);
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  render(<SpinningWheel showButton />);

  const button = screen.getByText("Girar Roleta");

  const user = userEvent.setup();
  await user.click(button);

  expect(consoleSpy).toHaveBeenCalledWith("Nenhuma fatia encontrada para o ângulo sorteado");
  expect(pushMock).not.toHaveBeenCalled();
});
