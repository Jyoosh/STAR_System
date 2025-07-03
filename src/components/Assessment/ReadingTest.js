// src/pages/StudentDashboard.js
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import TrialReadingTest from '../components/Assessment/TrialReadingTest';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const introKey = `seenIntro_${user?.id}`;
  const [showIntro, setShowIntro] = useState(false);
  const [showTrial, setShowTrial] = useState(false);

  useEffect(() => {
    if (user) {
      const seen = localStorage.getItem(introKey) === 'true';
      setShowIntro(!seen);
    }
  }, [user, introKey]);

  useEffect(() => {
    if (showIntro && audioRef.current) {
      audioRef.current.play().catch(() => {
        // autoplay blocked by browser
      });
    }
  }, [showIntro]);

  const finishIntro = () => {
    localStorage.setItem(introKey, 'true');
    setShowIntro(false);
    audioRef.current?.pause();
  };

  const lastDate = user?.lastAssessment
    ? new Date(user.lastAssessment).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const firstName = user?.first_name || 'Student';

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      {/* INTRO OVERLAY */}
      {showIntro && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md mb-4">
            <ReactPlayer
              url="/assets/intro-character.mp4"
              playing
              width="100%"
              height="auto"
              onEnded={finishIntro}
            />
          </div>

          <audio ref={audioRef} src="/assets/voice-greeting.mp3" />

          <button
            onClick={finishIntro}
            className="mt-4 px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Skip Intro
          </button>
        </div>
      )}

      {/* MAIN DASHBOARD */}
      {!showIntro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg"
        >
          {/* Greeting */}
          <motion.h2
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-3xl font-extrabold text-indigo-700 mb-2"
          >
            Welcome, {firstName}!
          </motion.h2>
          <p className="text-gray-600 mb-4">Role: {user?.role}</p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={() => {
                localStorage.removeItem(introKey);
                setShowIntro(true);
              }}
              className="px-4 py-2 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-500 transition"
            >
              Replay Intro/Tutorial
            </button>

            <button
              onClick={() => setShowTrial(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Try a Sneak Peek (Trial)
            </button>
          </div>

          {/* Summary Card */}
          <div className="bg-gray-50 p-4 rounded mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Current Level:</span>
              <span className="font-semibold">{user?.currentLevel || 'Not assessed yet'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Assessment:</span>
              <span>{lastDate}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/assess')}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              Start Assessment
            </motion.button>
          </div>

          <h3 className="text-lg font-semibold">Assessment Progress</h3>
          <p className="mt-2 text-gray-600">
            You haven’t started any assessments yet.
          </p>
        </motion.div>
      )}

      {/* TRIAL MODAL */}
      {showTrial && (
        <div className="absolute inset-0 z-50 bg-white/95 flex items-center justify-center p-4">
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
