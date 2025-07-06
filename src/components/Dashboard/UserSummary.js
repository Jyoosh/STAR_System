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
    <div className="space-y-4 text-sm sm:text-base">
      <motion.h2
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-xl sm:text-3xl font-extrabold text-[#295A12] text-center sm:text-left"
      >
        Welcome, {firstName}!
      </motion.h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-gray-700">
        <div className="flex items-center gap-2">
          <FaUserGraduate className="text-[#398908]" />
          <span className="font-medium">Role:</span>
          <span className="text-gray-800">{role}</span>
        </div>

        <div className="flex items-center gap-2">
          <FaClock className="text-[#398908]" />
          <span className="font-medium">Last Assessment:</span>
          <span className="text-gray-800">
            {lastDateDisplay || <em className="text-gray-500">None yet</em>}
          </span>
        </div>
      </div>

      {onReplayIntro && (
        <div className="flex justify-center sm:justify-start">
          <button
            onClick={onReplayIntro}
            className="px-4 py-2 bg-[#C6E90E] text-[#295A12] font-medium rounded hover:bg-[#87DC3F] transition flex items-center gap-2"
            title="Replay the reading intro tutorial"
          >
            <FaRedo /> Replay Intro/Tutorial
          </button>
        </div>
      )}

      <div className="bg-[#F9FFF2] p-4 sm:p-5 rounded-lg shadow-sm border border-[#87DC3F] space-y-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2 text-[#295A12]">
            <FaLevelUpAlt className="text-[#398908]" />
            <span className="font-medium">Current Level:</span>
          </div>
          <span className="font-semibold text-gray-800 text-sm sm:text-base">
            {currentLevelDisplay || <em className="text-gray-500">Not assessed yet</em>}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartAssessment}
          className="w-full py-2.5 bg-[#295A12] text-white rounded-lg hover:bg-[#398908] focus:outline-none focus:ring-2 focus:ring-[#87DC3F] transition flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <FaPlay />
          {hasHistory ? 'Retake Assessment' : 'Start Assessment'}
        </motion.button>
      </div>

      {!hasHistory && (
        <div className="text-center text-sm text-gray-600 flex items-center justify-center gap-2 mt-2">
          <FaInfoCircle className="text-[#398908]" />
          You haven't taken an assessment yet. Click "Start Assessment" to begin.
        </div>
      )}
    </div>
  );
}
