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
  return (
    <div className="flex space-x-4 mt-6">
      <motion.button
        onClick={hit}
        className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Hit
      </motion.button>
      <motion.button
        onClick={stand}
        className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Stand
      </motion.button>
      <motion.button
        onClick={double}
        className={`px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold transition ${
          !canDouble ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-600"
        }`}
        whileHover={canDouble ? { scale: 1.05 } : {}}
        whileTap={canDouble ? { scale: 0.95 } : {}}
        disabled={!canDouble}
      >
        Double
      </motion.button>
      <motion.button
        onClick={split}
        className={`px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold transition ${
          !canSplit ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-600"
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
