import { test, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { TimeBar } from "@/components/quiz/TimeBar";

/* - Capturando os props passados pro motion.div (animate, onAnimationComplete), e o controlador retornado por useAnimationControls, pra poder inspecionar e disparar manualmente o que o TimeBar faz com eles - */

const startMock = vi.fn();
const stopMock = vi.fn();
let capturedOnAnimationComplete: (() => void) | undefined;

vi.mock("motion/react", () => ({
  motion: {
    div: ({ onAnimationComplete }: any) => {
      capturedOnAnimationComplete = onAnimationComplete;
      return <div data-testid="time-bar-fill" />;
    },
  },
  useAnimationControls: () => ({ start: startMock, stop: stopMock }),
}));

const onTimeIsUp = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  capturedOnAnimationComplete = undefined;
});

/* - Testando se a animação é disparada ao montar, com a configuração esperada (15 segundos, de verde até vermelho) - */

test("should start the animation on mount", () => {
  render(
    <TimeBar
      onTimeIsUp={onTimeIsUp}
      isAnswered={false}
    />,
  );

  expect(startMock).toHaveBeenCalledWith(
    expect.objectContaining({
      width: "0%",
      background: ["#22C55E", "#84CC16", "#EAB308", "#F97316", "#F82828"],
      transition: expect.objectContaining({ duration: 15 }),
    }),
  );
});

/* - Testando se a animação é pausada quando a pergunta já foi respondida - */

test("should stop the animation when isAnswered becomes true", () => {
  const { rerender } = render(
    <TimeBar
      onTimeIsUp={onTimeIsUp}
      isAnswered={false}
    />,
  );

  expect(stopMock).not.toHaveBeenCalled();

  rerender(
    <TimeBar
      onTimeIsUp={onTimeIsUp}
      isAnswered
    />,
  );

  expect(stopMock).toHaveBeenCalledTimes(1);
});

/* - Testando se a animação não é pausada enquanto isAnswered continua false - */

test("should not stop the animation while isAnswered stays false", () => {
  render(
    <TimeBar
      onTimeIsUp={onTimeIsUp}
      isAnswered={false}
    />,
  );

  expect(stopMock).not.toHaveBeenCalled();
});

/* - Testando se o fim da animação (tempo esgotado) dispara o callback onTimeIsUp - */

test("should call onTimeIsUp when the fill animation completes", () => {
  render(
    <TimeBar
      onTimeIsUp={onTimeIsUp}
      isAnswered={false}
    />,
  );

  capturedOnAnimationComplete?.();

  expect(onTimeIsUp).toHaveBeenCalledTimes(1);
});
