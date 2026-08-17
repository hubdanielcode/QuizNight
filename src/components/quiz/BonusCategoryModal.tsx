"use client";

import { categories } from "@/types/categories";
import { CategoryOptionButton } from "../ui/CategoryOptionsButton";
import { RedirectToHome } from "./RedirectToHome";

const BonusCategoryModal = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(circle_at_75%_30%,#2E1F5E_0%,#1A1235_45%,#0D0818_100%),linear-gradient(135deg,rgba(64,118,195,0.08)_0%,transparent_50%)] bg-blend-screen">
        <div className="flex flex-col items-center justify-center bg-white/20 border border-white/30 rounded-xl">
          <span className="pt-3 text-2xl font-semibold text-white">Escolha a Categoria</span>

          <ul className="flex flex-col items-center justify-center gap-y-2 text-xl w-70 m-5">
            {categories
              .map((category) => (
                <li
                  className="w-full rounded-xl"
                  key={category.id}
                >
                  <CategoryOptionButton category={category} />
                </li>
              ))
              .slice(1, categories.length)}
          </ul>
        </div>
      </div>
    </>
  );
};

export { BonusCategoryModal };
