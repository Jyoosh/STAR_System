import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import StartAssessmentModal from '../components/Assessment/StartAssessmentModal';
import UserSummary from '../components/Dashboard/UserSummary';
import AssessmentHistory from '../components/Dashboard/AssessmentHistory';

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
  const latest = history.length > 0 ? history[0] : null;

  const lastDateDisplay = latest?.assessed_at
    ? new Date(latest.assessed_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '—';

  const currentLevelDisplay = latest?.reading_level || 'Not assessed yet';


  // Intro tutorial check
  useEffect(() => {
    if (user) {
      const seen = localStorage.getItem(introKey) === 'true';
      setShowIntro(!seen);
    }
  }, [user, introKey]);

  useEffect(() => {
    if (showIntro && audioRef.current) audioRef.current.play().catch(() => { });
  }, [showIntro]);

  const finishIntro = () => {
    localStorage.setItem(introKey, 'true');
    setShowIntro(false);
    audioRef.current?.pause();
  };

  // Fetch history
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/getAssessmentHistory.php?id=${user.id}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.results)) {
          setHistory(json.results);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      }
    })();
  }, [user]);

  // When assessment completes
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
    try {
      const res = await fetch(`${API_BASE}/saveAssessment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // Add new entry at front
      setHistory(prev => [
        {
          id: `new-${Date.now()}`,
          assessed_at: payload.timestamp,
          total_score: total,
          max_score: json.max_score,
          accuracy: json.accuracy,
          reading_level: json.reading_level,
          level: levelLabel,
          level1_score: payload.levelScores.level1,
          level2_score: payload.levelScores.level2,
          level3_score: payload.levelScores.level3,
          level4_score: payload.levelScores.level4,
        },
        ...prev,
      ]);

      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error('Save error:', err);
      alert(`Error saving assessment: ${err.message}`);
    }
  };

  const toggleLog = (id) => setExpandedLogId(prev => (prev === id ? null : id));

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
          onComplete={(res) => {
            handleAssessmentComplete(res);
            setShowAssessmentModal(false);
          }}
        />
      )}

      {!showIntro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg"
        >
          <UserSummary
            firstName={firstName}
            role={user?.role}
            lastDateDisplay={lastDateDisplay}
            currentLevelDisplay={currentLevelDisplay}
            onReplayIntro={finishIntro}
            onStartAssessment={() => setShowAssessmentModal(true)}
          />

          <AssessmentHistory
            history={history}
            expandedLogId={expandedLogId}
            toggleLog={toggleLog}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </motion.div>
      )}
    </div>
  );
}
