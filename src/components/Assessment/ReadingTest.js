import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { motion } from 'framer-motion';
import TrialReadingTest from '../components/Assessment/TrialReadingTest';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showTrial, setShowTrial] = useState(false);

  const lastDate = user?.lastAssessment
    ? new Date(user.lastAssessment).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const firstName = user?.first_name || 'Student';

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-[#C6E90E] px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto bg-white px-4 py-6 rounded-xl shadow-md"
      >
        {/* Greeting */}
        <motion.h2
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-2xl sm:text-3xl font-extrabold text-[#295A12] mb-2"
        >
          Welcome, {firstName}!
        </motion.h2>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">Role: {user?.role}</p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => setShowTrial(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#87DC3F] text-white rounded hover:bg-[#398908] transition"
          >
            Try a Sneak Peek (Trial)
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3 shadow-sm">
          <div className="flex justify-between text-sm sm:text-base">
            <span className="font-medium">Current Level:</span>
            <span className="font-semibold text-[#295A12]">
              {user?.currentLevel || 'Not assessed yet'}
            </span>
          </div>
          <div className="flex justify-between text-sm sm:text-base">
            <span className="font-medium">Last Assessment:</span>
            <span>{lastDate}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/assess')}
            className="w-full py-3 bg-[#295A12] text-white rounded-lg hover:bg-[#398908] focus:outline-none focus:ring-2 focus:ring-[#87DC3F] transition"
          >
            Start Assessment
          </motion.button>
        </div>

        <h3 className="text-lg font-semibold text-[#295A12]">Assessment Progress</h3>
        <p className="mt-2 text-gray-600 text-sm">
          You haven’t started any assessments yet.
        </p>
      </motion.div>

      {/* TRIAL MODAL */}
      {showTrial && (
        <div className="fixed inset-0 z-50 bg-white/95 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white w-full max-w-lg p-6 rounded-lg shadow-xl">
            <button
              onClick={() => setShowTrial(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
            >
              ✖️
            </button>
            <TrialReadingTest />
          </div>
        </div>
      )}
    </div>
  );
}
