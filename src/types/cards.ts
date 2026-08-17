import { AlertCircle, Clock, Crown, LucideIcon, Phone, Zap } from "lucide-react";

export interface SingleCardProps {
  id: number;
  icon: LucideIcon;
  text: string;
  iconColor: string;
  backgroundColor: string;
}

export const homeCards: SingleCardProps[] = [
  {
    id: 1,
    icon: Crown,
    text: "Acertos sobem sua coroa. Erros passam a para a próximo categoria.",
    iconColor: "text-[#60A5FA]",
    backgroundColor: "bg-[#60A5FA40]",
  },

  {
    id: 2,
    icon: Clock,
    text: "Quanto mais rápido acertar, mais pontos acumula.",
    iconColor: "text-[#FB923C]",
    backgroundColor: "bg-[#FB923C40]",
  },

  {
    id: 3,
    icon: Zap,
    text: "Cair no Bônus deixa você escolher a próxima categoria.",
    iconColor: "text-[#E8B923]",
    backgroundColor: "bg-[#E8B92340]",
  },
];

export const errorCards: SingleCardProps[] = [
  {
    id: 1,
    icon: AlertCircle,
    text: "Falha ao consultar o banco de dados.",
    iconColor: "text-red-400",
    backgroundColor: "bg-red-500/20",
  },

  {
    id: 2,
    icon: Clock,
    text: "O problema pode ser temporário — aguarde um instante.",
    iconColor: "text-amber-400",
    backgroundColor: "bg-amber-400/20",
  },

  {
    id: 3,
    icon: Phone,
    text: "Persistindo? Contacte o suporte do Quiz Night.",
    iconColor: "text-blue-400",
    backgroundColor: "bg-blue-400/20",
  },
];
