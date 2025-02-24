"use client";

import { motion } from "framer-motion";

const Score = ({ cash }: { cash: number }) => {
  return (
    <motion.div
      className="text-white text-2xl font-semibold bg-black bg-opacity-50 px-6 py-2 rounded-lg mb-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Cash: ${cash}
    </motion.div>
  );
};

export default Score;
