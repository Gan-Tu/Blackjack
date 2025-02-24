'use client';

import { motion } from 'framer-motion';

const Controls = ({
  hit,
  stand,
}: {
  hit: () => void;
  stand: () => void;
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
    </div>
  );
};

export default Controls;