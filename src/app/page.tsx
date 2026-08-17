import { Clock, Crown, Sparkles } from "lucide-react";
import { categories } from "../types/categories";
import { SpinningWheel } from "../components/quiz/SpinningWheel";
import { Cards } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { homeCards } from "@/types/cards";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[radial-gradient(circle_at_75%_30%,#2E1F5E_0%,#1A1235_45%,#0D0818_100%),linear-gradient(135deg,rgba(64,118,195,0.08)_0%,transparent_50%)] bg-blend-screen">
      <div className="flex flex-col flex-1 w-full max-w-6xl mx-auto px-6 sm:px-10 md:px-16">
        {/* - Header - */}

        <header className="flex items-center justify-between w-full mb-4">
          {/* - Icone + Nome - */}

          <div className="flex items-center gap-2 mt-6 sm:mt-8">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#E8B923] fill-current mr-2" />

            <p className="text-xl sm:text-2xl font-semibold text-white uppercase">
              Quiz <span className="text-[#E8B923]">Night</span>
            </p>
          </div>

          {/* - Indicador de nível - */}

          <div className="flex mt-6 sm:mt-8">
            <div className="flex items-center justify-center border px-3 py-1.5 bg-white/20 border-gray-600 rounded-full text-[#E8B923]">
              <Crown className="h-4 w-4 mr-2" />

              {/* - Por enquanto vai ficar Nivel 1, depois eu vou deixar dinâmico - */}

              <p className="text-sm font-semibold">Nível 1</p>
            </div>
          </div>
        </header>

        {/* - Main - */}

        <main>
          <div className="flex flex-col md:flex-row pt-8 sm:pt-10">
            {/* - Array de categorias - */}

            <section className="flex flex-col md:flex-1">
              <div className="flex flex-col mt-6 text-3xl sm:text-4xl md:text-5xl font-black text-white space-y-1.5">
                <p>Gire a roleta.</p>

                <p>
                  <span className="text-[#4076C3]">Responda </span>rápido.
                </p>

                <p className="text-[#EA9746]">Vire lenda.</p>
              </div>

              <p className="w-full sm:w-105 text-sm sm:text-base text-[#C9C1EE] my-6">
                Cada rodada sorteia uma categoria e um relógio começa a correr. Acerte para subir de
                coroa — erre e a roda passa pro próximo tema
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex justify-center items-center text-sm text-[#A99CFF]">
                  <Clock className="h-4 w-4 m-2.5" />

                  <p>Rodadas de 15s por pergunta</p>
                </div>
              </div>

              {/* - Botão de jogar - */}

              <div className="flex mt-6">
                <Button text="Jogar Agora" />
              </div>

              {/* - Legenda - */}

              <div className="flex mt-6">
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {categories.map((category) => (
                    <li
                      className="flex items-center justify-center"
                      key={category.id}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full mr-2 ${category.background}`} />

                      <p className="text-[#C9C1EE]">{category.label}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* - Roleta - */}

            <section className="flex flex-col">
              <div className="relative flex items-center justify-center md:flex-1 my-8 md:mt-0">
                {/* - Glow atrás da roleta - */}

                <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-[radial-gradient(circle,rgba(232,185,35,0.25)_0%,rgba(64,118,195,0.15)_45%,transparent_75%)] blur-2xl pointer-events-none" />

                <div className="relative drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
                  <SpinningWheel showButton={false} />
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* - Cards - */}

        <section className="relative flex py-20 mx-auto md:mt-0">
          {/* - Glow atrás dos cards - */}

          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(64,118,195,0.12)_0%,transparent_70%)] blur-2xl pointer-events-none" />

          <div className="relative">
            <Cards cards={homeCards} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
