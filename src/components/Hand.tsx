"use client";

import { calculateHandValue } from "@/utils";
import { motion } from "framer-motion";

// Define Unicode symbols for each suit
const suitSymbols: { [key: string]: string } = {
  Hearts: "♥",
  Diamonds: "♦",
  Clubs: "♣",
  Spades: "♠"
};

const Hand = ({
  hand,
  isDealer,
  revealAll
}: {
  hand: { suit: string; value: string }[];
  isDealer: boolean;
  revealAll: boolean;
}) => {
  if (!hand || hand.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <p className="text-white text-lg">
          {isDealer ? "Dealer Hand" : "Player Hand"}
        </p>
      </div>
    );
  }

  const displayHand = isDealer && !revealAll ? [hand[0]] : hand;
  const handValue = calculateHandValue(hand);

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-2">
        {displayHand.map((card, index) => (
          <motion.div
            key={index}
            className="w-24 h-36 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center text-black"
            initial={{ y: -100, opacity: 0, rotate: -10 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.4, delay: index * 0.15 }} // Adjusted for smoother animation
          >
            <span className="text-2xl font-bold">{card.value}</span>
            <span className="text-4xl">{suitSymbols[card.suit]}</span>
          </motion.div>
        ))}
        {isDealer && !revealAll && hand.length > 1 && (
          <motion.div
            className="w-24 h-36 bg-gray-700 rounded-lg shadow-lg flex items-center justify-center text-white"
            initial={{ y: -100, opacity: 0, rotate: -10 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-2xl">?</span>
          </motion.div>
        )}
      </div>
      <motion.div
        className="mt-2 text-white text-lg font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {isDealer && !revealAll ? "Dealer Hand" : `Hand Value: ${handValue}`}
      </motion.div>
    </div>
  );
};

export default Hand;
