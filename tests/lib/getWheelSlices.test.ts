import { test, expect } from "vitest";
import { getWheelSlices } from "@/lib/getWheelSlices";
import { categories } from "@/types/categories";

/* - Testando se o número de fatias corresponde ao número de categorias - */

test("should return one slice per category", () => {
  const slices = getWheelSlices();

  expect(slices).toHaveLength(categories.length);
});

/* - Testando se o ângulo de cada fatia é igual (360° dividido pelo total de categorias) - */

test("should give every slice the same angle, dividing 360 degrees evenly", () => {
  const slices = getWheelSlices();
  const expectedAngle = 360 / categories.length;

  slices.forEach((slice) => {
    expect(slice.sliceAngle).toBe(expectedAngle);
  });
});

/* - Testando se os ângulos iniciais/finais são contíguos: a primeira fatia começa em 0°, e cada fatia seguinte começa exatamente onde a anterior termina - */

test("should start the first slice at 0 degrees", () => {
  const [firstSlice] = getWheelSlices();

  expect(firstSlice.startingAngle).toBe(0);
});

test("should chain each slice's starting angle to the previous slice's ending angle", () => {
  const slices = getWheelSlices();

  for (let i = 1; i < slices.length; i++) {
    expect(slices[i].startingAngle).toBe(slices[i - 1].endingAngle);
  }
});

test("should end the last slice exactly at 360 degrees", () => {
  const slices = getWheelSlices();
  const lastSlice = slices[slices.length - 1];

  expect(lastSlice.endingAngle).toBe(360);
});

/* - Testando se o ângulo do meio fica exatamente entre o início e o fim - */

test("should place the middle angle exactly between the starting and ending angles", () => {
  const slices = getWheelSlices();

  slices.forEach((slice) => {
    expect(slice.middleAngle).toBe((slice.startingAngle + slice.endingAngle) / 2);
  });
});

/* - Testando se cada fatia carrega a categoria correspondente, na ordem certa - */

test("should associate each slice with its matching category in order", () => {
  const slices = getWheelSlices();

  slices.forEach((slice, index) => {
    expect(slice.category).toEqual(categories[index]);
  });
});

/* - Testando se o path SVG gerado começa no centro da roleta (50,50), como o desenho de cada seção exige - */

test("should build an SVG path starting at the wheel's center", () => {
  const slices = getWheelSlices();

  slices.forEach((slice) => {
    expect(slice.path.startsWith("M 50,50")).toBe(true);
  });
});
