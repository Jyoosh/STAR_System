import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { motion } from 'framer-motion';
import StartAssessmentModal from '../components/Assessment/StartAssessmentModal';
import SpeechDefectAssessment from '../components/Assessment/SpeechDefectAssessment';
import UserSummary from '../components/Dashboard/UserSummary';
import AssessmentHistory from '../components/Dashboard/AssessmentHistory';

const API_BASE =
  process.env.REACT_APP_API_BASE?.replace(/\/+$/, '') ||
  `${window.location.origin}/star-app/api`;

export default function StudentDashboard() {
  const { user, refreshUser } = useContext(AuthContext);

  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showSpeechDefectModal, setShowSpeechDefectModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0); // 🔁 for re-fetching after save
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

  // Fetch history from backend, re-run when refreshKey changes
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
  }, [user, refreshKey]);

  const toggleLog = (id) => setExpandedLogId((prev) => (prev === id ? null : id));

return (
  <>
    {/* 🔒 Fullscreen Modal: Outside layout */}
    {showAssessmentModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <StartAssessmentModal
          onClose={() => setShowAssessmentModal(false)}
          onComplete={() => {
            if (refreshUser) refreshUser();
            setShowAssessmentModal(false);
          }}
          onSaveComplete={() => setRefreshKey((prev) => prev + 1)}
        />
      </div>
    )}

    {showSpeechDefectModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <SpeechDefectAssessment
          onExit={() => setShowSpeechDefectModal(false)}
          onReturnToStart={() => setShowSpeechDefectModal(false)}
          onComplete={() => {
            if (refreshUser) refreshUser();
            setShowSpeechDefectModal(false);
          }}
          onSaveComplete={() => setRefreshKey((prev) => prev + 1)}
        />
      </div>
    )}

    {/* 🧱 Page content */}
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-screen-lg w-full mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-lg"
      >
        <UserSummary
          firstName={firstName}
          role={user?.role}
          lastDateDisplay={lastDateDisplay}
          currentLevelDisplay={currentLevelDisplay}
          onStartAssessment={() => setShowAssessmentModal(true)}
          onStartSpeechDefectAssessment={() => setShowSpeechDefectModal(true)}
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
    </div>
  </>
);

}
