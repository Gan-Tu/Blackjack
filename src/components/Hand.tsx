"use client";

import { calculateHandValue } from "@/utils";
import { motion } from "framer-motion";
import { type Card } from "./Deck";

const suitSymbols: Record<string, string> = {
  Hearts: "♥",
  Diamonds: "♦",
  Clubs: "♣",
  Spades: "♠"
};

const redSuits = new Set(["Hearts", "Diamonds"]);

const Hand = ({
  hand,
  isDealer,
  revealAll
}: {
  hand: Card[];
  isDealer: boolean;
  revealAll: boolean;
}) => {
  if (!hand || hand.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <p className="text-white text-lg drop-shadow-md">
          {isDealer ? "Dealer Hand" : "Player Hand"}
        </p>
      </div>
    );
  }

  const displayHand =
    isDealer && !revealAll
      ? [hand[0], { suit: "hidden", value: "hidden" }]
      : hand;
  const handValue = calculateHandValue(hand);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-2">
        {displayHand.map((card, index) => (
          <motion.div
            key={
              isDealer && !revealAll && index === 1
                ? "hidden"
                : `${card.suit}-${card.value}-${index}`
            }
            className={
              isDealer && !revealAll && index === 1
                ? "flex aspect-[2/3] w-16 items-center justify-center rounded-lg border border-slate-600 bg-slate-700 text-white shadow-lg sm:w-20 lg:w-24"
                : `flex aspect-[2/3] w-16 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white shadow-lg sm:w-20 lg:w-24 ${
                    redSuits.has(card.suit) ? "text-rose-600" : "text-slate-950"
                  }`
            }
            initial={{ y: -24, opacity: 0, rotate: -5 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 24, opacity: 0, rotate: 5 }}
            transition={{ duration: 0.18, delay: index * 0.04 }}
          >
            {isDealer && !revealAll && index === 1 ? (
              <span className="text-2xl font-bold">?</span>
            ) : (
              <>
                <span className="text-xl font-black sm:text-2xl">
                  {card.value}
                </span>
                <span className="text-3xl sm:text-4xl">
                  {suitSymbols[card.suit]}
                </span>
              </>
            )}
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-2 text-base font-semibold text-white drop-shadow-md sm:text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {isDealer && !revealAll ? "Dealer Hand" : `Hand Value: ${handValue}`}
      </motion.div>
    </div>
  );
};

export default Hand;
