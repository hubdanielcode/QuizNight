import { SingleCardProps } from "@/types/cards";

interface CardsProps {
  className?: string;
  cards: SingleCardProps[];
}

const Cards = ({ className, cards }: CardsProps) => {
  return (
    <div className="w-full">
      <ul className="flex flex-col gap-4 p-0 sm:p-6 w-full max-w-md md:max-w-none mx-auto">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <li
              key={card.id}
              className={`flex items-center gap-3 w-2xl px-5 sm:px-4 py-3 sm:py-3 bg-white/20 hover:bg-white/30 border border-white/10 backdrop-blur-sm rounded-xl transition-colors ${className ?? ""}`}
            >
              <span
                className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg shrink-0 ${card.backgroundColor}`}
              >
                <Icon className={`w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 ${card.iconColor}`} />
              </span>

              <p className="text-sm sm:text-base text-[#C9C1EE] font-medium leading-snug">
                {card.text}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { Cards };
