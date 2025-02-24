'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const Bet = ({
  startGame,
  cash,
  lastBet,
  replayWithLastBet,
}: {
  startGame: (amount: number) => void;
  cash: number;
  lastBet: number;
  replayWithLastBet: () => void;
}) => {
  const [amount, setAmount] = useState(lastBet || 0);

  const handlePlaceBet = () => {
    if (amount > 0 && amount <= cash) {
      startGame(amount);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center bg-white bg-opacity-20 p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="p-2 border rounded-lg mb-4 w-48 text-center"
        placeholder="Enter bet amount"
        min="1"
        max={cash}
      />
      <div className="flex space-x-4">
        <motion.button
          onClick={handlePlaceBet}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={amount <= 0 || amount > cash}
        >
          Place Bet
        </motion.button>
        {lastBet > 0 && lastBet <= cash && (
          <motion.button
            onClick={replayWithLastBet}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Same Bet (${lastBet})
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default Bet;