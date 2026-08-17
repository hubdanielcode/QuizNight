"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

const Loading = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    setIsLoading(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 4);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_75%_30%,#2E1F5E_0%,#1A1235_45%,#0D0818_100%),linear-gradient(135deg,rgba(64,118,195,0.08)_0%,transparent_50%)] bg-blend-screen z-50">
      <AnimatePresence>
        {isLoading && (
          <>
            <div className="flex items-center justify-center text-white text-4xl font-bold mr-1">
              <span>Carregando</span>

              <motion.div>
                {[1, 2, 3].map((dotNumber, index) => (
                  <motion.span
                    key={index}
                    animate={{ opacity: currentStep >= dotNumber ? 1 : 0 }}
                  >
                    .
                  </motion.span>
                ))}
              </motion.div>
            </div>

            <div className="h-12 w-12 border-2 border-gray-300/30 border-t-2 border-t-[#E8B923] animate-spin rounded-full mt-5" />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Loading;
