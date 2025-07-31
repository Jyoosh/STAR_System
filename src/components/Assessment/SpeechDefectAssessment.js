import React, { useState, useContext } from 'react';
import Confetti from 'react-confetti';
import Level1Sd from './Levels_SD/Level1_SD';
import Level2Sd from './Levels_SD/Level2_SD';
import Level3Sd from './Levels_SD/Level3_SD';
import Level4StorySd from './Levels_SD/Level4Story_SD';
import Level4QuizSd from './Levels_SD/Level4Quiz_SD';
import { AuthContext } from '../../auth/AuthContext';
import { toast } from 'react-toastify';

const LEVELS = {
  sd_level1: { title: 'Alphabet Recognition', component: Level1Sd },
  sd_level2: { title: 'CVC Words', component: Level2Sd },
  sd_level3: { title: 'Spelling and Reading', component: Level3Sd },
};

export default function SpeechDefectAssessment({ onComplete, onExit, onReturnToStart, onSaveComplete }) {
  const { user } = useContext(AuthContext);
  const [currentLevel, setCurrentLevel] = useState('sd_level1');
  const [scores, setScores] = useState({ level1: 0, level2: 0, level3: 0, level4: 0 });
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [debugUnlocked, setDebugUnlocked] = useState(false);
  const [level4Ready, setLevel4Ready] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_BASE?.replace(/\/+$/, '') ||
    `${window.location.origin}/star-app/api`;

  const saveAssessment = async ({
    scores,
    total,
    currentLevel,
    assessmentType = 'With Speech Defect',
    reading_level = 'Level 1',
  }) => {
    const user_id = user?.user_id || user?.id;
    if (!user_id) {
      toast.error('Missing user ID. Cannot save assessment.');
      return currentLevel;
    }

    const cleanScores = {
      level1: Number(scores.level1) || 0,
      level2: Number(scores.level2) || 0,
      level3: Number(scores.level3) || 0,
      level4: Number(scores.level4) || 0,
    };

    const payload = {
      user_id,
      total_score: total,
      currentLevel,
      levelScores: cleanScores,
      timestamp: new Date().toISOString(),
      assessment_type: assessmentType,
      reading_level,
    };

    try {
      const response = await fetch(`${API_BASE}/saveAssessment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to save assessment.');
      } else {
        if (onSaveComplete) onSaveComplete(); // 🔁 Refresh dashboard
      }

      return reading_level;
    } catch (err) {
      toast.error('Network error: unable to save assessment.');
      return reading_level;
    }
  };

  const handleLevelComplete = async (levelKey, score, passed) => {
    const updated = { ...scores, [levelKey]: score };
    setScores(updated);
    const levelNumber = levelKey.replace('level', '');
    const label = `Level ${levelNumber}`;

    if (!passed) {
      const total = Object.entries(updated)
        .filter(([key]) => key === levelKey || key < levelKey)
        .reduce((sum, [, val]) => sum + (Number(val) || 0), 0);

      await saveAssessment({
        scores: updated,
        total,
        currentLevel: label,
        reading_level: label,
      });

      setResult({
        level: levelKey,
        levelNumber,
        title: getTitle(levelKey),
        score,
        passed: false,
      });

      if (onSaveComplete) onSaveComplete(); // ✅ Ensure dashboard refresh
      return;
    }

    const newResult = {
      level: levelKey,
      levelNumber,
      title: getTitle(levelKey),
      score,
      passed: true,
    };

    setResult(newResult);

    if (levelKey === 'level4') {
      const total = Object.values(updated).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0
      );

      const readingLabel = await saveAssessment({
        scores: updated,
        total,
        currentLevel: 'Level 4',
        reading_level: 'Level 4',
      });

      if (onSaveComplete) onSaveComplete();

      onComplete({
        total,
        levelScores: updated,
        levelLabel: readingLabel,
      });
    } else {
      setShowConfetti(true);
    }
  };

  const getTitle = (key) => {
    const map = {
      level1: 'Alphabet Hunters',
      level2: 'Sound Rangers',
      level3: 'Jumbled Letters, Listen, and Type',
      level4: 'Story Explorers - The Final Challenge',
    };
    return map[key];
  };

  const handleProceed = () => {
    if (!result) return;

    const next = parseInt(result.level.replace('level', '')) + 1;
    setResult(null);
    setShowConfetti(false);

    if (next === 4) {
      setCurrentLevel('sd_level4');
      setLevel4Ready(false);
    } else {
      setCurrentLevel(`sd_level${next}`);
    }
  };

  const handleSDQuizComplete = (rawScore) => {
    const level4Score = rawScore * 2;
    handleLevelComplete('level4', level4Score, rawScore === 5);
  };

  const requestDebugAccess = () => {
    const input = prompt('Enter debug password:');
    if (input === '!2E') {
      setDebugUnlocked(true);
    } else {
      alert('Incorrect password');
    }
  };

  const renderLevel = () => {
    if (LEVELS[currentLevel]) {
      const LevelComponent = LEVELS[currentLevel].component;
      const levelKey = currentLevel.replace('sd_', '');
      return (
        <LevelComponent
          onComplete={(score, passed) =>
            handleLevelComplete(levelKey, score, passed)
          }
          onExit={onExit}
        />
      );
    }

    if (currentLevel === 'sd_level4') {
      return level4Ready ? (
        <Level4QuizSd onComplete={handleSDQuizComplete} />
      ) : (
        <Level4StorySd onComplete={() => setLevel4Ready(true)} />
      );
    }

    return null;
  };

  return (
    <>
      {renderLevel()}

      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti numberOfPieces={300} recycle={false} gravity={0.4} />
        </div>
      )}

      {['sd_level1', 'sd_level2', 'sd_level3'].includes(currentLevel) && (
        <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-2 items-end">
          {!debugUnlocked ? (
            <button
              onClick={requestDebugAccess}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
            >
              🔒 Unlock Debug
            </button>
          ) : (
            <button
              onClick={() => {
                setShowConfetti(true);
                setTimeout(() => {
                  const levelKey = currentLevel.replace('sd_', '');
                  handleLevelComplete(levelKey, 10, true);
                }, 800);
              }}
              className="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 transition"
            >
              🧪 Auto‑Pass {currentLevel.toUpperCase()}
            </button>
          )}
        </div>
      )}

      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-indigo-200 bg-opacity-70 backdrop-blur-md transition-opacity duration-300"></div>
          <div className="relative z-10 w-full sm:max-w-lg md:max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-green-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-green-700 mb-4">
              Level {result.levelNumber}: {result.title}
            </h2>
            <p className="text-center text-gray-700 mb-2">
              ✅ You finished! Your score: {result.score} out of 10.
            </p>
            {!result.passed && (
              <>
                <p className="text-center text-red-600 font-semibold">
                  ❌ You must get a perfect score to proceed to the next level.
                </p>
                <p className="text-center mt-1 text-gray-700">
                  Your reading level is Level {result.levelNumber}.
                </p>
              </>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {result.passed ? (
                <button
                  onClick={handleProceed}
                  className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Proceed to Level {parseInt(result.levelNumber) + 1}
                </button>
              ) : (
                <button
                  onClick={onReturnToStart}
                  className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Return to Start
                </button>
              )}
              <button
                onClick={onExit}
                className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
