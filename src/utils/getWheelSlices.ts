import { categories } from "@/types/categories";
import { WheelSliceProps } from "@/types/wheelSlice";

const getWheelSlices = (): WheelSliceProps[] => {
  /* - Definindo o tamanho da roleta e o ângulo de cada seção - */

  const wheelCenter = 50;
  const wheelRadius = 50;
  const sliceAngle = 360 / categories.length;

  return categories.map((category, index) => {
    /* - Definindo os ângulos de cada seção - */

    const startingAngle = index * sliceAngle;
    const endingAngle = startingAngle + sliceAngle;

    /* - Convertendo o ângulo de graus para radiano (JS só entende radiano) - */

    const toRadian = (degree: number) => (degree * Math.PI) / 180;

    /* - Decidindo se o arco vai ser curto (sliceAngle < 180°) ou longo (sliceAngle > 180°) - */

    const arcSize = sliceAngle > 180 ? 1 : 0;

    /* - Posicionando as divisórias - */

    const x1 = (wheelCenter + wheelRadius * Math.cos(toRadian(startingAngle))).toFixed(2);
    const y1 = (wheelCenter + wheelRadius * Math.sin(toRadian(startingAngle))).toFixed(2);
    const x2 = (wheelCenter + wheelRadius * Math.cos(toRadian(endingAngle))).toFixed(2);
    const y2 = (wheelCenter + wheelRadius * Math.sin(toRadian(endingAngle))).toFixed(2);

    /* - Desenhando cada seção: d="M L A Z" - */

    const path = `M ${wheelCenter},${wheelCenter} L ${x1},${y1} A ${wheelRadius},${wheelRadius} 0 ${arcSize},1 ${x2},${y2} Z`;

    /* - Calculando o centro da seção para posicionar o icone" - */

    const sliceRadius = 25;
    const middleAngle = (startingAngle + endingAngle) / 2;

    const iconX = wheelCenter + sliceRadius * Math.cos(toRadian(middleAngle));
    const iconY = wheelCenter + sliceRadius * Math.sin(toRadian(middleAngle));

    return {
      category,
      sliceAngle,
      startingAngle,
      middleAngle,
      endingAngle,
      path,
      iconX,
      iconY,
    };
  });
};

export { getWheelSlices };
