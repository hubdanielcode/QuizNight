"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

interface AnswerListProps {
  possibleAnswers: string[];
  submitAnswerResult: { isCorrect: boolean; rightAnswer: string } | null;
  onSelectAnswer: (clickedAnswer: string) => void;
}

const AnswersList = ({ possibleAnswers, submitAnswerResult, onSelectAnswer }: AnswerListProps) => {
  const [chosenAnswer, setChosenAnswer] = useState<string | null>(null);

  const handleSelectAnswer = (clickedAnswer: string) => {
    if (chosenAnswer !== null) {
      return;
    }
    setChosenAnswer(clickedAnswer);
    onSelectAnswer(clickedAnswer);
  };

  const handleGetAnswerColor = (answer: string) => {
    return submitAnswerResult === null
      ? "text-white bg-white/20 border-white/30"
      : answer === submitAnswerResult.rightAnswer
        ? "text-green-400 bg-green-500/20 border-green-400/40"
        : answer === chosenAnswer
          ? "text-red-400 bg-red-500/20 border-red-400/40"
          : "text-white/50 bg-white/10 border-white/20";
  };

  return (
    <ul className="grid grid-cols-2 w-full gap-8 mx-auto">
      {possibleAnswers.map((answer, index) => (
        <li
          className="min-w-0"
          key={index}
        >
          <motion.button
            className={`flex items-center justify-center gap-2 w-full font-semibold transition-colors duration-300 ${handleGetAnswerColor(answer)} border rounded-xl px-4 py-2 ${chosenAnswer === null ? "cursor-pointer" : ""}`}
            whileHover={chosenAnswer === null ? { scale: 1.05 } : {}}
            whileTap={chosenAnswer === null ? { scale: 0.95 } : {}}
            onClick={() => handleSelectAnswer(answer)}
            disabled={chosenAnswer !== null}
          >
            {submitAnswerResult !== null && answer === submitAnswerResult.rightAnswer && (
              <Check className="w-4 h-4" />
            )}
            {submitAnswerResult !== null &&
              answer === chosenAnswer &&
              answer !== submitAnswerResult.rightAnswer && <X className="w-4 h-4" />}
            <span className="line-clamp-2 min-w-0">{answer}</span>
          </motion.button>
        </li>
      ))}
    </ul>
  );
};

export { AnswersList };
