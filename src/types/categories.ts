import { LucideIcon, Gamepad2, Film, Music2, Crown } from "lucide-react";

export interface CategoriesProps {
  id: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  color: string;
  background: string;
  hoverColor?: string;
}

export const categories: CategoriesProps[] = [
  {
    id: "bonus",
    label: "Bonus",
    icon: Crown,
    iconColor: "#E8B923",
    color: "#4076C3",
    background: "bg-[#4076C3]",
  },

  {
    id: "filmes",
    label: "Filmes",
    icon: Film,
    iconColor: "#863666CC",
    color: "#E05BAA",
    background: "bg-[#E05BAA]",
    hoverColor: "#E087BC",
  },

  {
    id: "jogos",
    label: "Jogos",
    icon: Gamepad2,
    iconColor: "#397743CC",
    color: "#60C770",
    background: "bg-[#60C770]",
    hoverColor: "#8FE09B",
  },

  {
    id: "musicas",
    label: "Músicas",
    icon: Music2,
    iconColor: "#8C5A2ACC",
    color: "#EA9746",
    background: "bg-[#EA9746]",
    hoverColor: "#F2C393",
  },
];
