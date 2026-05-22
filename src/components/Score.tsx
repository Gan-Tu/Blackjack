"use client";

import { motion } from "framer-motion";

const Score = ({ cash }: { cash: number }) => {
  return (
    <motion.div
      className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-white shadow-lg backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
        Cash
      </p>
      <p className="text-2xl font-bold">${cash}</p>
    </motion.div>
  );
};

export default Score;
