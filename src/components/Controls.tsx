"use client";

import { motion } from "framer-motion";

const Controls = ({
  hit,
  stand,
  double,
  split,
  canDouble,
  canSplit
}: {
  hit: () => void;
  stand: () => void;
  double: () => void;
  split: () => void;
  canDouble: boolean;
  canSplit: boolean;
}) => {
  const baseButtonClass =
    "min-h-12 rounded-lg px-5 py-3 text-sm font-bold shadow-lg transition sm:px-6 sm:text-base";

  return (
    <div className="grid w-full max-w-2xl grid-cols-4 gap-2 rounded-lg border border-white/15 bg-slate-950/80 p-2 shadow-2xl backdrop-blur sm:gap-3">
      <motion.button
        onClick={hit}
        className={`${baseButtonClass} bg-emerald-400 text-slate-950 hover:bg-emerald-300 cursor-pointer`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Hit
      </motion.button>
      <motion.button
        onClick={stand}
        className={`${baseButtonClass} bg-rose-500 text-white hover:bg-rose-400 cursor-pointer`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Stand
      </motion.button>
      <motion.button
        onClick={double}
        className={`${baseButtonClass} bg-violet-500 text-white ${
          !canDouble
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-violet-400 cursor-pointer"
        }`}
        whileHover={canDouble ? { scale: 1.05 } : {}}
        whileTap={canDouble ? { scale: 0.95 } : {}}
        disabled={!canDouble}
      >
        Double
      </motion.button>
      <motion.button
        onClick={split}
        className={`${baseButtonClass} bg-amber-400 text-slate-950 ${
          !canSplit
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-amber-300 cursor-pointer"
        }`}
        whileHover={canSplit ? { scale: 1.05 } : {}}
        whileTap={canSplit ? { scale: 0.95 } : {}}
        disabled={!canSplit}
      >
        Split
      </motion.button>
    </div>
  );
};

export default Controls;
