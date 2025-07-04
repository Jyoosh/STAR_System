import React from 'react';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaClock, FaLevelUpAlt, FaRedo, FaPlay, FaInfoCircle } from 'react-icons/fa';

export default function UserSummary({
  firstName,
  role,
  lastDateDisplay,
  currentLevelDisplay,
  onReplayIntro,
  onStartAssessment
}) {
  const hasHistory = lastDateDisplay && currentLevelDisplay && currentLevelDisplay !== 'Not assessed yet';

  return (
    <>
      <motion.h2
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-3xl font-extrabold text-indigo-700 mb-2"
      >
        Welcome, {firstName}!
      </motion.h2>

      <p className="text-gray-600 mb-4 flex items-center gap-2">
        <FaUserGraduate className="text-indigo-600" /> Role: {role}
      </p>

      <div className="mb-4 flex items-center gap-2">
        <FaClock className="text-gray-500" />
        <span className="font-medium">Last Assessment:</span>
        <span className="text-gray-700">
          {lastDateDisplay || <em className="text-gray-400">No assessment yet</em>}
        </span>
      </div>

      <div className="mb-6">
        <button
          onClick={onReplayIntro}
          className="px-4 py-2 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-500 transition flex items-center gap-2"
          title="Replay the reading intro tutorial"
        >
          <FaRedo /> Replay Intro/Tutorial
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded mb-6 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaLevelUpAlt className="text-indigo-600" />
            <span className="font-medium">Current Level:</span>
          </div>
          <span className="font-semibold text-gray-800">
            {currentLevelDisplay || <em className="text-gray-400">Not assessed yet</em>}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartAssessment}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition flex items-center justify-center gap-2"
        >
          <FaPlay />
          {hasHistory ? 'Retake Assessment' : 'Start Assessment'}
        </motion.button>
      </div>

      {!hasHistory && (
        <div className="text-center text-sm text-gray-500 flex justify-center items-center gap-2 mt-2">
          <FaInfoCircle />
          You haven't taken an assessment yet. Click "Start Assessment" to begin.
        </div>
      )}
    </>
  );
}
