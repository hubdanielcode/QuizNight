"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { CategoriesProps } from "@/types/categories";

const CategoryOptionButton = ({ category }: { category: CategoriesProps }) => {
  const router = useRouter();

  return (
    <motion.button
      className={`flex items-center justify-center w-full border-2 rounded-xl ${category.background} px-4 py-2 cursor-pointer`}
      whileHover={{ scale: 1.05, backgroundColor: category.hoverColor }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        router.push(`/quiz/${category.id}`);
      }}
    >
      <span className="text-base font-semibold">{category.label}</span>
    </motion.button>
  );
};

export { CategoryOptionButton };
