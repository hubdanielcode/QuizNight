"use client";

import { getWheelSlices } from "@/lib/getWheelSlices";
import { Crown, Sparkles, Triangle } from "lucide-react";
import { Fragment, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";

const SpinningWheel = ({ showButton }: { showButton: boolean }) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  /* - Definições - */

  const router = useRouter();

  const slices = getWheelSlices();
  const iconSize = 12;
  const wheelRef = useRef<SVGSVGElement | null>(null);

  /* - Funções - */

  // 1. Fazendo a roleta girar

  const handleSpinTheWheel = async () => {
    const initialSpinDinstance = 5 * 360;
    const extraSpinDistance = Math.random() * 360;
    const totalSpinDistance = initialSpinDinstance + extraSpinDistance;

    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${totalSpinDistance}deg)`;
    }

    const landingPoint = (((270 - totalSpinDistance) % 360) + 360) % 360;

    const landedSlice = slices.find(
      (slice) => landingPoint >= slice.startingAngle && landingPoint < slice.endingAngle,
    );

    if (!landedSlice) {
      console.error("Nenhuma fatia encontrada para o ângulo sorteado");
      return;
    }

    // 2. Esperando 7.5s para acabar a animação da roleta para, ai sim, trocar de página

    const handleWaitSpin = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(router.push(`/quiz/${landedSlice.category.id}`));
        }, 7500);
      });
    };

    handleWaitSpin();
  };

  return (
    <div className="relative flex flex-col items-center md:ml-18">
      {/* - Marcador - */}

      <Triangle className="absolute -top-1 left-1/2 -translate-x-1/2 fill-black z-10 rotate-180 w-4 h-4 sm:w-5 sm:h-5 md:w-6.5 md:h-6.5" />

      <div className="relative flex h-56 w-56 sm:h-72 sm:w-72 md:h-96 md:w-96 border rounded-full">
        <svg
          className="transition-transform duration-7500 ease-out"
          viewBox="0 0 100 100"
          ref={wheelRef}
        >
          {slices.map((slice) => {
            const Icon = slice.category.icon;

            return (
              <Fragment key={slice.category.id}>
                <path
                  d={slice.path}
                  fill={slice.category.color}
                  stroke="black"
                  strokeWidth={0.5}
                />

                <foreignObject
                  x={slice.iconX - iconSize / 2}
                  y={slice.iconY - iconSize / 2}
                  width={iconSize}
                  height={iconSize}
                >
                  <Icon
                    size={iconSize}
                    color={slice.category.iconColor}
                    fill={slice.category.icon === Crown ? slice.category.iconColor : "none"}
                  />
                </foreignObject>
              </Fragment>
            );
          })}
        </svg>

        {/* - Círculo central da roleta - */}

        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-black absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <Sparkles className="text-center w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#E8B923]" />
        </div>
      </div>

      {/* - Botão de girar a roleta - */}

      {showButton && (
        <Button
          className="mt-8"
          text="Girar Roleta"
          onClick={() => {
            setIsSpinning(true);
            handleSpinTheWheel();
          }}
          disabled={isSpinning}
        />
      )}
    </div>
  );
};

export { SpinningWheel };
