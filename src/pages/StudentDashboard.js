import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import StartAssessmentModal from '../components/Assessment/StartAssessmentModal';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const API_BASE =
  process.env.REACT_APP_API_BASE?.replace(/\/+$/, '') ||
  `${window.location.origin}/star-app/api`;

export default function StudentDashboard() {
  const { user, refreshUser } = useContext(AuthContext);
  const audioRef = useRef(null);
  const introKey = `seenIntro_${user?.id}`;

  const [showIntro, setShowIntro] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const firstName = user?.first_name || 'Student';
  const lastDateDisplay = user?.lastAssessment
    ? new Date(user.lastAssessment).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';
  const currentLevelDisplay = user?.currentLevel || 'Not assessed yet';

  useEffect(() => {
    if (user) {
      const seen = localStorage.getItem(introKey) === 'true';
      setShowIntro(!seen);
    }
  }, [user, introKey]);

  useEffect(() => {
    if (showIntro && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [showIntro]);

  const finishIntro = () => {
    localStorage.setItem(introKey, 'true');
    setShowIntro(false);
    audioRef.current?.pause();
  };

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE}/getAssessmentHistory.php?id=${user.id}`);
        const json = await response.json();
        if (json?.results) setHistory(json.results);
      } catch (error) {
        console.error('HISTORY error:', error);
      }
    };
    fetchHistory();
  }, [user]);

  const handleAssessmentComplete = async ({ total, levelScores, levelLabel }) => {
    const payload = {
      user_id: user.id,
      total_score: total,
      levelScores: {
        level1: levelScores.level1 || 0,
        level2: levelScores.level2 || 0,
        level3: levelScores.level3 || 0,
        level4: levelScores.level4 || 0,
      },
      currentLevel: levelLabel,
      timestamp: new Date().toISOString(),
    };

    console.log('Submitting assessment payload:', payload);

    try {
      const res = await fetch(`${API_BASE}/saveAssessment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Save failed');

      const newEntry = {
        id: `new-${Date.now()}`,
        assessed_at: payload.timestamp,
        total_score: total,
        max_score: json.max_score,
        accuracy: json.accuracy,
        reading_level: json.reading_level,
        level1_score: payload.levelScores.level1,
        level2_score: payload.levelScores.level2,
        level3_score: payload.levelScores.level3,
        level4_score: payload.levelScores.level4,
      };

      setHistory(prev => [newEntry, ...prev]);
      if (refreshUser) await refreshUser();
    } catch (error) {
      console.error('handleAssessmentComplete error:', error);
      alert(`Error saving: ${error.message}`);
    }
  };

  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleLog = (id) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      {showIntro && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md mb-4">
            <ReactPlayer url="/assets/intro-character.mp4" playing width="100%" height="auto" onEnded={finishIntro} />
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

      {showAssessmentModal && (
        <StartAssessmentModal
          onClose={() => setShowAssessmentModal(false)}
          onComplete={(result) => {
            handleAssessmentComplete(result);
            setShowAssessmentModal(false);
          }}
        />
      )}

      {!showIntro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg"
        >
          <motion.h2
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-3xl font-extrabold text-indigo-700 mb-2"
          >
            Welcome, {firstName}!
          </motion.h2>
          <p className="text-gray-600 mb-4">Role: {user?.role}</p>

          <div className="mb-4">
            <span className="font-medium">Last Assessment:</span>
            <span className="ml-2">{lastDateDisplay}</span>
          </div>

          <div className="mb-6">
            <button
              onClick={() => {
                localStorage.removeItem(introKey);
                setShowIntro(true);
              }}
              className="px-4 py-2 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-500 transition"
            >
              Replay Intro/Tutorial
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Current Level:</span>
              <span className="font-semibold">{currentLevelDisplay}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAssessmentModal(true)}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              Start Assessment
            </motion.button>
          </div>

          <h3 className="text-lg font-semibold">Assessment History</h3>
          <p className="mt-2 text-gray-600">
            {history.length ? 'Here’s a summary of your past assessments.' : 'You haven’t started any assessments yet.'}
          </p>

          {history.length > 0 && (
            <div className="mt-6 space-y-4">
              {paginatedHistory.map((r) => {
                const date = new Date(r.assessed_at);
                const formatted = date.toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });
                const isExpanded = expandedLogId === r.id;
                return (
                  <div key={r.id} className="bg-gray-50 rounded-lg shadow">
                    <button
                      className="w-full flex justify-between items-center p-4 focus:outline-none"
                      onClick={() => toggleLog(r.id)}
                    >
                      <span className="text-sm font-medium text-indigo-700">
                        {formatted} - Score: {r.total_score}/{r.max_score} ({r.accuracy}%)
                      </span>
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 text-sm text-gray-700">
                        <p className="mb-1 font-medium text-green-700">Reading Level: {r.reading_level}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>Level 1: {r.level1_score}</div>
                          <div>Level 2: {r.level2_score}</div>
                          <div>Level 3: {r.level3_score}</div>
                          <div>Level 4: {r.level4_score}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-center items-center gap-4 pt-4">
                <button
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-indigo-200 hover:bg-indigo-300 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Prev
                </button>
                <span className="text-sm">Page {currentPage}</span>
                <button
                  disabled={currentPage * itemsPerPage >= history.length}
                  className="px-3 py-1 rounded bg-indigo-200 hover:bg-indigo-300 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
