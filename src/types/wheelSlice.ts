import { CategoriesProps } from "./categories";

export interface WheelSliceProps {
  category: CategoriesProps;
  sliceAngle: number;
  startingAngle: number;
  middleAngle: number;
  endingAngle: number;
  path: string;
  iconX: number;
  iconY: number;
}
