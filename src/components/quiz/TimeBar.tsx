import { motion, useAnimationControls } from "motion/react";
import { useEffect } from "react";

interface TimeBarProps {
  onTimeIsUp: () => void;
  isAnswered: boolean;
}

const TimeBar = ({ onTimeIsUp, isAnswered }: TimeBarProps) => {
  const animation = useAnimationControls();

  /* - Disparando a animação ao montar o componente. - */

  useEffect(() => {
    animation.start({
      width: "0%",
      background: ["#22C55E", "#84CC16", "#EAB308", "#F97316", "#F82828"],
      transition: { duration: 15, ease: "linear", times: [0, 0.25, 0.5, 0.75, 1] },
    });
  }, [animation]);

  /* - Pausando a animação quando isAnswered === true - */

  useEffect(() => {
    if (isAnswered === true) {
      animation.stop();
    }
  }, [animation, isAnswered]);

  return (
    <div className="flex flex-col min-w-3xl mx-auto pt-18">
      <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          animate={animation}
          onAnimationComplete={onTimeIsUp}
        />
      </div>
    </div>
  );
};

export { TimeBar };
