import React, { useState, useContext } from 'react';
import Confetti from 'react-confetti';
import TrialReadingTest from './TrialReadingTest';
import Level1 from './Levels/Level1';
import Level2 from './Levels/Level2';
import Level3 from './Levels/Level3';
import Level4Story from './Levels/Level4Story';
import Level4Quiz from './Levels/Level4Quiz';
import { AuthContext } from '../../auth/AuthContext';
import { toast } from 'react-toastify';

export default function StartAssessmentModal({ onClose, onComplete }) {
  const { user } = useContext(AuthContext);
  const [currentLevel, setCurrentLevel] = useState('start');
  const [showConfetti, setShowConfetti] = useState(false);
  const [level1FailedScore, setLevel1FailedScore] = useState(null);
  const [scores, setScores] = useState({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
  });

  const API_BASE =
    process.env.REACT_APP_API_BASE?.replace(/\/+$/, '') ||
    `${window.location.origin}/star-app/api`;

  const isModalLevel = ['start', 'level1Failed', 'level4Quiz'].includes(currentLevel);

  const handleStartAssessment = () => setCurrentLevel(1);
  const handleTryTrial = () => setCurrentLevel(0);

  const saveAssessment = async ({ scores, total, currentLevel }) => {
  const maxScore = 40;
  const accuracy = maxScore > 0 ? (total / maxScore) * 100 : 0;

  let readingLabel = 'Emerging Reader';
  if (accuracy >= 90) readingLabel = 'Fluent Reader';
  else if (accuracy >= 75) readingLabel = 'Transitional Reader';
  else if (accuracy >= 50) readingLabel = 'Developing Reader';

  const payload = {
    user_id: user?.id,
    total_score: total,
    currentLevel,
    levelScores: scores,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${API_BASE}/saveAssessment.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!json.success) {
      toast.error(json.error || 'Failed to save assessment.');
    } else {
      console.log('Saved assessment:', json);
    }

    return readingLabel;
  } catch (error) {
    console.error('Save error:', error);
    toast.error('Network error: unable to save assessment.');
    return readingLabel;
  }
};

  const handleLevelComplete = (level, score, passed) => {
    setScores(prev => ({ ...prev, [level]: score }));

    if (level === 'level1') {
      const total = score;
      const level1OnlyScores = {
        level1: score,
        level2: 0,
        level3: 0,
        level4: 0,
      };

      saveAssessment({
        scores: level1OnlyScores,
        total,
        currentLevel: 'Level 1',
      });

      if (!passed) {
        setLevel1FailedScore(score);
        setCurrentLevel('level1Failed');
      } else {
        setCurrentLevel(2);
      }
      return;
    }

    if (level === 'level2') setCurrentLevel(3);
    else if (level === 'level3') setCurrentLevel('level4Story');
  };

const handleQuizComplete = async (level4RawScore) => {
  const level4Score = level4RawScore * 2; // Scale to 2 points per correct
  const updatedScores = { ...scores, level4: level4Score };
  const total = Object.values(updatedScores).reduce((sum, val) => sum + val, 0);

  const readingLabel = await saveAssessment({
    scores: updatedScores,
    total,
    currentLevel: readingLabelFromAccuracy(updatedScores, total),
  });

  onComplete({ total, levelScores: updatedScores, levelLabel: readingLabel });
};


  const readingLabelFromAccuracy = (scores, total) => {
    const maxScore = Object.values(scores).filter(s => typeof s === 'number').length;
    const accuracy = maxScore > 0 ? (total / maxScore) * 100 : 0;
    if (accuracy >= 90) return 'Fluent Reader';
    if (accuracy >= 75) return 'Transitional Reader';
    if (accuracy >= 50) return 'Developing Reader';
    return 'Emerging Reader';
  };

  const returnToStart = () => {
    // Notify parent of failure result only if coming from level1Failed
    if (currentLevel === 'level1Failed') {
      onComplete({
        total: scores.level1,
        levelScores: {
          level1: scores.level1,
          level2: 0,
          level3: 0,
          level4: 0,
        },
        levelLabel: 'Level 1',
      });
    }

    setCurrentLevel('start');
    setLevel1FailedScore(null);
    setShowConfetti(false);
  };

  const exitAssessment = () => {
    if (currentLevel === 'level1Failed') {
      onComplete({
        total: scores.level1,
        levelScores: {
          level1: scores.level1,
          level2: 0,
          level3: 0,
          level4: 0,
        },
        levelLabel: 'Level 1',
      });
    }

    onClose();
    setCurrentLevel('start');
    setLevel1FailedScore(null);
    setShowConfetti(false);
  };

  const renderContent = () => {
    if (currentLevel === 'level4Quiz') {
      return <Level4Quiz onComplete={handleQuizComplete} />;
    }

    switch (currentLevel) {
      case 'start':
        return (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-center text-indigo-700 mb-4">Start Assessment</h2>
            <p className="text-gray-600 text-center mb-6">
              Would you like to try a trial first or proceed directly to the assessment?
            </p>
            <div className="flex flex-col gap-4">
              <button onClick={handleTryTrial} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                Try a Trial
              </button>
              <button onClick={handleStartAssessment} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Take Assessment
              </button>
            </div>
          </>
        );
      case 0:
        return <TrialReadingTest onComplete={() => setCurrentLevel(1)} onClose={() => setCurrentLevel('start')} />;
      case 1:
        return (
          <Level1
            onComplete={({ score, passed }) => {
              if (passed) setShowConfetti(true);
              handleLevelComplete('level1', score, passed);
            }}
            onExit={exitAssessment}
          />
        );
      case 2:
        return <Level2 onComplete={(score, passed) => handleLevelComplete('level2', score, passed)} onExit={exitAssessment} />;
      case 3:
        return <Level3 onComplete={(score, passed) => handleLevelComplete('level3', score, passed)} onExit={exitAssessment} />;
      case 'level4Story':
        return (
          <div className="max-h-[80vh] overflow-y-auto">
            <Level4Story onComplete={() => setCurrentLevel('level4Quiz')} />
            <div className="text-center mt-4">
              <button onClick={exitAssessment} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Exit
              </button>
            </div>
          </div>
        );
      case 'level1Failed':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-red-600">Level 1: Alphabet Recognition</h2>
            <p>✅ You finished! Your score: {level1FailedScore} out of 10.</p>
            <p>❌ You must get a perfect score to proceed to the next level.</p>
            <p>Your reading level is <strong>Level 1</strong>.</p>
            <div className="flex gap-4 mt-6">
              <button onClick={returnToStart} className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Return to Start
              </button>
              <button onClick={exitAssessment} className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Exit
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {isModalLevel ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-300"></div>
          <div className="relative z-10 w-full sm:max-w-lg md:max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-indigo-100 transition-all duration-300 ease-out max-h-[90vh] overflow-y-auto">
            <button
              onClick={exitAssessment}
              className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600 transition text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
            {renderContent()}
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 overflow-y-auto">{renderContent()}</div>
      )}

      {/* Debug Button for testing Level 1 auto-pass */}
      {currentLevel === 1 && (
        <div className="fixed bottom-6 right-6 z-[1000]">
          <button
            onClick={() => {
              setShowConfetti(true);
              handleLevelComplete('level1', 10, true);
            }}
            className="px-4 py-2 bg-purple-700 text-white rounded-lg shadow-lg hover:bg-purple-800 transition"
          >
            🧪 Auto-Pass Level 1 (Debug)
          </button>
        </div>
      )}

      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti numberOfPieces={300} recycle={false} gravity={0.4} />
        </div>
      )}
    </div>
  );
}
