import { Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PlayAgainProps {
  isOpen?: boolean;
  score?: number;
  gameEnded?: "timesUp" | "wrongAnswer" | null;
  onPlayAgain: () => void;
}

const PlayAgain = ({ isOpen, score, gameEnded, onPlayAgain }: PlayAgainProps) => {
  const modalVariant = {
    timesUp: { title: "Tempo Esgotado" },
    wrongAnswer: { title: "Você Errou" },
  };

  if (!gameEnded) {
    return null;
  }

  const { title } = modalVariant[gameEnded];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="flex items-center justify-center min-h-screen max-w-full fixed inset-0 bg-black/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center justify-center max-w-md px-4 py-2 bg-white/20 border border-white/30 rounded-xl gap-y-2"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <span className="text-lg font-semibold uppercase bg-linear-to-br bg-clip-text text-transparent from-amber-400 via-amber-500 to-amber-600 tracking-[0.2em] pt-4">
              {title}
            </span>

            <span className="text-xl font-semibold text-white">Que pena!</span>

            {score !== undefined && (
              <p className="text-white font-semibold">
                Sua Pontuação:{" "}
                <span className="bg-linear-to-br bg-clip-text text-transparent from-amber-400 via-amber-500 to-amber-600 pb-2">
                  {score}
                </span>
              </p>
            )}

            <motion.button
              className="flex items-center justify-center px-4 py-2 mt-4 mb-4 bg-[#E8B923] hover:bg-[#AA891A] text-lg font-bold rounded-full text-[#241852] hover:text-[#1B1141] cursor-pointer shadow-[0_0_20px_rgba(232,185,35,0.35)] hover:shadow-[0_0_28px_rgba(232,185,35,0.55)] transition-shadow disabled:cursor-not-allowed disabled:bg-[#E8B92350] disabled:hover:bg-[#AA891A50]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayAgain}
            >
              <Play className="h-4 w-4 fill-current mr-1.5" />
              Jogar Novamente
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { PlayAgain };
