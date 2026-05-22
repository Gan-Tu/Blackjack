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
  const chipValues = [25, 50, 100, 250].filter((value) => value <= cash);

  const handlePlaceBet = () => {
    if (amount > 0 && amount <= cash) {
      startGame(amount);
    }
  };

  return (
    <motion.div
      className="rounded-lg border border-white/15 bg-slate-950/70 p-4 shadow-xl backdrop-blur"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
            Wager
          </p>
          <p className="text-sm text-slate-200">Pick a chip or type an amount.</p>
        </div>
        {lastBet > 0 && lastBet <= cash && (
          <motion.button
            onClick={replayWithLastBet}
            className="min-h-10 rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300 cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Same ${lastBet}
          </motion.button>
        )}
      </div>
      <div className="mb-4 grid grid-cols-4 gap-2">
        {chipValues.map((value) => (
          <motion.button
            key={value}
            onClick={() => setAmount(value)}
            className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-bold transition cursor-pointer ${
              amount === value
                ? "border-amber-300 bg-amber-300 text-slate-950"
                : "border-white/15 bg-white/10 text-white hover:bg-white/20"
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            ${value}
          </motion.button>
        ))}
      </div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="mb-4 h-11 w-full rounded-lg border border-white/15 bg-white px-3 text-center text-lg font-semibold text-slate-950 outline-none ring-amber-300 transition focus:ring-2"
        placeholder="Enter bet amount"
        min={1}
        max={cash}
      />
      <div className="flex">
        <motion.button
          onClick={handlePlaceBet}
          className="min-h-11 w-full rounded-lg bg-sky-500 px-6 py-2 font-bold text-white transition hover:bg-sky-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          whileHover={amount > 0 && amount <= cash ? { scale: 1.02 } : {}}
          whileTap={amount > 0 && amount <= cash ? { scale: 0.98 } : {}}
          disabled={amount <= 0 || amount > cash}
        >
          Place Bet
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Bet;
