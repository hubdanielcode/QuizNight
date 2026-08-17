"use client";

import { motion } from "motion/react";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { validateGame } from "@/actions/validateGame";

interface ButtonProps {
  className?: string;
  text: string;
  textColor?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const Button = ({ className, text, textColor, onClick, disabled }: ButtonProps) => {
  const router = useRouter();

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }

    await validateGame();
    router.push("/quiz");
  };

  return (
    <motion.button
      className={`flex items-center justify-center px-4 py-2 bg-[#E8B923] hover:bg-[#AA891A] text-lg font-bold rounded-full cursor-pointer shadow-[0_0_20px_#E8B92359] hover:shadow-[0_0_26px_#E8B9238C] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed ${textColor ?? "text-[#241852] hover:text-[#1B1141]"} ${className ?? ""}`}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={disabled}
    >
      <Play className="h-4 w-4 fill-current mr-1.5" />
      {text}
    </motion.button>
  );
};

export { Button };
