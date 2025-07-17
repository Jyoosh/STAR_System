import React from 'react';
import { motion } from 'framer-motion';

export default function GameCard({ title, description, icon, onPlay }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white border border-[#87DC3F] rounded-xl p-5 flex flex-col items-center text-center shadow-md hover:shadow-lg transition"
    >
      <div className="mb-3 text-[#398908] text-4xl">{icon}</div>

      <h4 className="font-bold text-lg text-[#295A12] mb-2">{title}</h4>

      <p className="text-sm text-gray-600 mb-4">{description}</p>

      <button
        onClick={onPlay}
        className="mt-auto px-4 py-2 bg-[#295A12] text-white rounded hover:bg-[#398908] transition text-sm"
      >
        Play
      </button>
    </motion.div>
  );
}
