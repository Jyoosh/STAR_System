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

export default function StartAssessmentModal({ onClose, onComplete, debugAutoPass }) {
  const { user } = useContext(AuthContext);
  const [currentLevel, setCurrentLevel] = useState('start');
  const [showConfetti, setShowConfetti] = useState(false);
  const [level1FailedScore, setLevel1FailedScore] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [levelResult, setLevelResult] = useState(null);
  // const [hasSaved, setHasSaved] = useState(false);
  const [hasFinalized, setHasFinalized] = useState(false);
  // const [level2FailedScore, setLevel2FailedScore] = useState(null);
  // const [level3FailedScore, setLevel3FailedScore] = useState(null);
  const [scores, setScores] = useState({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
  });

  const API_BASE =
    process.env.REACT_APP_API_BASE?.replace(/\/+$/, '') ||
    `${window.location.origin}/star-app/api`;

  const handleStartAssessment = () => setCurrentLevel(1);
  const handleTryTrial = () => setCurrentLevel(0);

  const saveAssessment = async ({ scores, total, currentLevel }) => {
    // ✅ Ensure no nulls
    const safeScores = {
      level1: Number(scores.level1) || 0,
      level2: Number(scores.level2) || 0,
      level3: Number(scores.level3) || 0,
      level4: Number(scores.level4) || 0,
    };

    const totalScore = Number(total) || 0;

    const maxScore = 40;
    const accuracy = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    let readingLabel = 'Level 1';
    if (accuracy >= 90) readingLabel = 'Level 4';
    else if (accuracy >= 75) readingLabel = 'Level 3';
    else if (accuracy >= 50) readingLabel = 'Level 2';

    const payload = {
      user_id: user?.id,
      total_score: totalScore,
      currentLevel,
      levelScores: safeScores,
      readingLabel,
      timestamp: new Date().toISOString(),
    };

    try {
      console.log("📤 Submitting to API:", JSON.stringify(payload, null, 2));

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


  const handleLevelComplete = (level, scoreInput, passedInput) => {
    const numericLevel = Number(level.replace('level', ''));

    // Normalize the inputs: extract score and passed from object if needed
const score = Number(scoreInput);
const passed = passedInput;

    const newLevelResult = { score, passed, level: numericLevel };
    setLevelResult(newLevelResult);

    // === LEVEL 1 COMPLETE ===
    if (level === 'level1') {
      const updatedScores = {
        level1: score,
        level2: 0,
        level3: 0,
        level4: 0,
      };

      const total = score;

      setScores(updatedScores); // ✅ Store level1 score in state

      saveAssessment({
        scores: updatedScores,
        total,
        currentLevel: passed ? 'Level 2' : 'Level 1',
      });

      if (!passed) {
        setLevel1FailedScore(score);
        setCurrentLevel('level1Failed');
      } else {
        setCurrentLevel('levelPassed');
      }

      return;
    }



    // === LEVEL 2 COMPLETE ===
    if (level === 'level2') {
      // Build the new scores object
      const updatedScores = {
        ...scores,
        level2: score,
        level3: 0,
        level4: 0,
      };

      const total = updatedScores.level1 + updatedScores.level2;

      // 1) Remember which level just passed
      setLevelResult({ score, passed, level: 2 });

      // 2) Update scores state
      setScores(updatedScores);

      // 3) Persist to backend using the correct, updatedScores
      saveAssessment({
        scores: updatedScores,
        total,
        currentLevel: passed ? 'Level 3' : 'Level 2',
      });

      // 4) Switch modal
      if (!passed) {
        setCurrentLevel('level2Failed');
      }
      else {
        setCurrentLevel('levelPassed');
      }

      return;
    }

    // === LEVEL 3 COMPLETE ===
    if (level === 'level3') {
      const newScores = {
        ...scores,
        level3: score,
        level4: 0,
      };
      const total = newScores.level1 + newScores.level2 + newScores.level3;

      saveAssessment({
        scores: newScores,
        total,
        currentLevel: passed ? 'Level 4' : 'Level 3',
      });

      if (!passed) {
        setCurrentLevel('level3Failed');
      } else {
        setLevelResult({ score, passed, level: 3 });
        setCurrentLevel('levelPassed');
      }
      setScores(newScores);
      return;
    }
  };

  const handleQuizComplete = async (level4RawScore) => {
    if (hasFinalized) return; // 🚫 Already processed
    setHasFinalized(true);    // ✅ Set lock immediately

    const level4Score = Number(level4RawScore) ? level4RawScore * 2 : 0;

    setScores(prevScores => {
      const updatedScores = {
        ...prevScores,
        level4: level4Score,
      };

      const total = Object.values(updatedScores).reduce((sum, val) => sum + (Number(val) || 0), 0);

      saveAssessment({
        scores: updatedScores,
        total,
        currentLevel: 'Level 4',
      }).then(readingLabel => {
        const resultPayload = {
          total,
          levelScores: updatedScores,
          levelLabel: readingLabel,
        };

        setFinalResult(resultPayload);
        onComplete(resultPayload); // ✅ One-time only
      });

      return updatedScores;
    });
  };




  const returnToStart = () => {
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

    if (finalResult && currentLevel === 'level4Quiz') {
      return (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-green-600">
            🎉 Level {
              finalResult?.levelScores?.level3 === 10 ||
                finalResult?.levelScores?.level3?.score === 10
                ? 3
                : finalResult?.levelScores?.level2 === 10 ||
                  finalResult?.levelScores?.level2?.score === 10
                  ? 2
                  : 1
            } Complete!
          </h2>




          <p>Total Score: {finalResult.total} out of 40</p>
          <p>Your Reading Level: <strong>{finalResult.levelLabel}</strong></p>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                setFinalResult(null);
                setCurrentLevel('start');
              }}
              className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Return to Start
            </button>
            <button
              onClick={exitAssessment}
              className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Exit
            </button>
          </div>
        </div>
      );
    }

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
            debugAutoPass={debugAutoPass} // ✅ add this line
          />
        );

      case 'levelPassed':
        const nextLevel = levelResult?.level + 1;

        const shouldSkipToQuiz =
          scores.level1 === 10 &&
          scores.level2 === 10 &&
          scores.level3 === 10;



        return (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-green-600">
              🎉 Level {levelResult.level} Complete!
            </h2>
            <p>You got a perfect score and can now proceed to the next level.</p>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  if (nextLevel === 4) {
                    setCurrentLevel('level4Story');
                  } else {
                    setCurrentLevel(nextLevel);
                  }
                }}


                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Proceed to {shouldSkipToQuiz ? 'Final Quiz' : `Level ${nextLevel}`}
              </button>
              <button
                onClick={exitAssessment}
                className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Exit
              </button>
            </div>
          </div>
        );


      case 2:
        return (
          <Level2
            onComplete={(score, passed) => handleLevelComplete('level2', score, passed)}
            onExit={exitAssessment}
            debugAutoPass={null}
          />

        );

      case 3:
        return <Level3 onComplete={(score, passed) => handleLevelComplete('level3', score, passed)} onExit={exitAssessment} />
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
      case 'level2Failed':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-red-600">Level 2: CVC Words</h2>
            <p>✅ You finished! Your score: {scores.level2} out of 10.</p>
            <p>❌ You must get a perfect score to proceed to the next level.</p>
            <p>Your reading level is <strong>Level 2</strong>.</p>
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
      case 'level3Failed':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-red-600">Level 3: Sentence Reading</h2>
            <p>✅ You finished! Your score: {scores.level3} out of 10.</p>
            <p>❌ You must get a perfect score to proceed to the next level.</p>
            <p>Your reading level is <strong>Level 3</strong>.</p>
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

  // This is inside your component, after renderContent is defined

  return (
    <div className="w-full">
      {/* MODAL STYLE LEVELS */}
      {[
        'start',
        'level1Failed',
        'levelPassed',
        'level2Failed',
        'level3Failed',
        'level4Story'
      ].includes(currentLevel) ? (
        // Modal layout
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-indigo-200 bg-opacity-70 backdrop-blur-md transition-opacity duration-300"></div>
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
        // Fullscreen layout
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">{renderContent()}</div>
      )}

      {/* DEBUG BUTTONS */}
      {[1, 2, 3].includes(currentLevel) && (
        <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-2 items-end">
          <button
            onClick={() => {
              setShowConfetti(true);
              setTimeout(() => {
                // Auto‑pass whatever level we're currently on:
                handleLevelComplete(`level${currentLevel}`, 10, true);
              }, 800);
            }}
            className="px-4 py-2 bg-purple-700 text-white rounded-lg shadow-lg hover:bg-purple-800 transition"
          >
            🧪 Auto‑Pass Level {currentLevel} (Debug)
          </button>
        </div>
      )}


      {/* CONFETTI */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti numberOfPieces={300} recycle={false} gravity={0.4} />
        </div>
      )}
    </div>
  );
} // end of function component

