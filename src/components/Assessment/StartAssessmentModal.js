import React, { useState, useContext } from 'react';
import ChooseAssessmentTypeModal from './ChooseAssessmentTypeModal';
import SpeechDefectAssessment from './SpeechDefectAssessment';
import Confetti from 'react-confetti';
import TrialReadingTest from './TrialReadingTest';
import Level1 from './Levels/Level1';
import Level2 from './Levels/Level2';
import Level3 from './Levels/Level3';
import Level4Story from './Levels/Level4Story';
import Level4Quiz from './Levels/Level4Quiz';
import { AuthContext } from '../../auth/AuthContext';
import { toast } from 'react-toastify';

export default function StartAssessmentModal({ onClose, onComplete, debugAutoPass, onSaveComplete }) {
  const { user } = useContext(AuthContext);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [currentLevel, setCurrentLevel] = useState('start');
  const [showConfetti, setShowConfetti] = useState(false);
  const [level1FailedScore, setLevel1FailedScore] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [levelResult, setLevelResult] = useState(null);
  const [debugUnlocked, setDebugUnlocked] = useState(false);
  const [hasFinalized, setHasFinalized] = useState(false);
  const [scores, setScores] = useState({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
  });

  const API_BASE =
    process.env.REACT_APP_API_BASE?.replace(/\/+$/, '') ||
    `${window.location.origin}/star-app/api`;

  const handleStartAssessment = () => {
    console.log("[DEBUG] Take Assessment clicked");
    setShowTypeModal(true);
  };

  const handleTryTrial = () => setCurrentLevel(0);

  const saveAssessment = async ({
    scores,
    total,
    currentLevel,
    assessmentType = 'Without Speech Defect',
    reading_level = null,
  }) => {
    const user_id = user?.user_id || user?.id;
    if (!user_id) {
      toast.error('Missing user ID. Cannot save assessment.');
      return null;
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
      reading_level: reading_level || currentLevel, // fallback
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
        return null;
      }

      return data.reading_level || currentLevel;
    } catch (err) {
      toast.error('Network error: unable to save assessment.');
      return null;
    }
  };


  const requestDebugAccess = () => {
    const input = prompt('Enter debug password:');
    if (input === '!2E') {
      setDebugUnlocked(true);
    } else {
      alert('Incorrect password');
    }
  };


  const handleLevelComplete = async (level, score, passed) => {
    const levelNum = Number(level.replace('level', ''));
    const updated = { ...scores, [`level${levelNum}`]: score };

    // Reset future levels
    for (let i = levelNum + 1; i <= 4; i++) updated[`level${i}`] = 0;

    setScores(updated);
    setLevelResult({ score, passed, level: levelNum });

    if (!passed) {
      const total = Object.values(updated)
        .slice(0, levelNum)
        .reduce((sum, s) => sum + s, 0);

      const label = `Level ${levelNum}`;

      await saveAssessment({
        scores: updated,
        total,
        currentLevel: label,
        assessmentType: 'Without Speech Defect',
        reading_level: label,
      });

      setHasFinalized(true); // ✅ Add this line

      // ✅ Notify parent to refresh history
      if (typeof onSaveComplete === 'function') {
        onSaveComplete();  // 🔁 trigger parent re-fetch
      }

      if (levelNum === 1) setLevel1FailedScore(score);
      setCurrentLevel(`level${levelNum}Failed`);
      return;
    }


    setCurrentLevel('levelPassed');
  };




  const handleQuizComplete = async (rawScore) => {
    if (hasFinalized) return;

    // ⛔ Prevent saving if user never reached Level 4
    if (currentLevel !== 'level4Quiz') return;

    setHasFinalized(true);

    const level4 = rawScore ? rawScore * 2 : 0;
    const updated = { ...scores, level4 };
    const total = Object.values(updated).reduce((sum, s) => sum + s, 0);

    const levelLabel = 'Level 4';

    await saveAssessment({
      scores: updated,
      total,
      currentLevel: levelLabel,
      assessmentType: 'Without Speech Defect',
      reading_level: levelLabel,
    });

    setHasFinalized(true);
    if (typeof onSaveComplete === 'function') {
      onSaveComplete();
    }
    const resultPayload = { total, levelScores: updated, levelLabel };
    setFinalResult(resultPayload);
    onComplete(resultPayload);
    setScores(updated);
  };







  const returnToStart = () => {
    // Only call onComplete if you’re actually finalizing results (e.g., failing Level 1)
    // BUT don't call it here if you're just returning to type selector
    // Remove onComplete call entirely here

    setFinalResult(null);              // clear any previous final results
    setLevelResult(null);             // clear level results
    setCurrentLevel('start');         // resets to main start screen
    setShowTypeModal(true);           // ✅ open ChooseAssessmentTypeModal
    setLevel1FailedScore(null);
    setShowConfetti(false);
  };



  const exitAssessment = async () => {
    // 🛡️ Prevent double save if already finalized
    if (hasFinalized) {
      setCurrentLevel('start');
      setLevel1FailedScore(null);
      setShowConfetti(false);
      onClose();
      return;
    }

    let total = 0;
    const failedLevel = currentLevel; // e.g. 'level2Failed'
    let levelLabel = 'Level 1';

    if (failedLevel === 'level1Failed') {
      total = scores.level1;
      levelLabel = 'Level 1';
    } else if (failedLevel === 'level2Failed') {
      total = scores.level1 + scores.level2;
      levelLabel = 'Level 2';
    } else if (failedLevel === 'level3Failed') {
      total = scores.level1 + scores.level2 + scores.level3;
      levelLabel = 'Level 3';
    }

    if (['level1Failed', 'level2Failed', 'level3Failed'].includes(failedLevel)) {
      await saveAssessment({
        scores,
        total,
        currentLevel: levelLabel,
        assessmentType: 'Without Speech Defect',
        reading_level: levelLabel, // ✅ ensure reading_level is passed
      });

      setHasFinalized(true); // ✅ mark as finalized so no future duplicate saves

      onComplete({
        total,
        levelScores: scores,
        levelLabel,
      });
    }

    setCurrentLevel('start');
    setLevel1FailedScore(null);
    setShowConfetti(false);
    onClose();
  };




  const renderContent = () => {

    if (finalResult && currentLevel === 'level4Quiz') {
      return (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-green-600">
            🎉 {finalResult.levelLabel} Complete!
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
    if (currentLevel === 'speech_defect_flow') {
      return (
        <SpeechDefectAssessment
          user={user}
          onExit={exitAssessment}
          onReturnToStart={() => {
            setCurrentLevel('start');
            setShowTypeModal(true);
          }}
          onComplete={(result) => {
            setFinalResult(result);
            onComplete(result);
          }}
        />
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
      {/* === CHOOSE TYPE MODAL === */}
      {showTypeModal ? (
        <ChooseAssessmentTypeModal
          onSelectType={(type) => {
            setShowTypeModal(false);
            console.log('✅ Chosen assessment type:', type);

            if (type === 'standard') {
              setCurrentLevel(1); // Regular assessment
            } else if (type === 'speech_defect') {
              setCurrentLevel('speech_defect_flow'); // Speech Defect flow
            }
          }}
          onCancel={() => setShowTypeModal(false)}
        />
      ) : (
        <>
          {/* === MODAL STYLE LEVELS === */}
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
            <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
              {renderContent()}
            </div>
          )}

          {/* === DEBUG BUTTONS === */}
          {[1, 2, 3].includes(currentLevel) && (
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
                      handleLevelComplete(`level${currentLevel}`, 10, true);
                    }, 800);
                  }}
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg shadow-lg hover:bg-purple-800 transition"
                >
                  🧪 Auto‑Pass Level {currentLevel}
                </button>
              )}
            </div>
          )}


          {/* === CONFETTI === */}
          {showConfetti && (
            <div className="fixed inset-0 z-50 pointer-events-none">
              <Confetti numberOfPieces={300} recycle={false} gravity={0.4} />
            </div>
          )}
        </>
      )}
    </div>
  );

} // end of function component

