import React, { useState } from 'react';
import TrialReadingTest from './TrialReadingTest';
import Level1 from './Levels/Level1';
import Level2 from './Levels/Level2';
import Level3 from './Levels/Level3';
import Level4Story from './Levels/Level4Story';
import Level4Quiz from './Levels/Level4Quiz';

export default function StartAssessmentModal({ onClose, onComplete }) {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [scores, setScores] = useState({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
  });

  const handleStartAssessment = () => setCurrentLevel(1);
  const handleTryTrial = () => setCurrentLevel(0);

  const handleLevelComplete = (level, score) => {
    setScores(prev => ({ ...prev, [level]: score }));
    if (level === 'level1') setCurrentLevel(2);
    else if (level === 'level2') setCurrentLevel(3);
    else if (level === 'level3') setCurrentLevel(4);
  };

  const handleQuizComplete = (level4Score) => {
    const updatedScores = { ...scores, level4: level4Score };
    const total = Object.values(updatedScores).reduce((sum, val) => sum + val, 0);

    let readingLabel = 'Emerging Reader';
    const maxScore = Object.values(updatedScores).filter(s => typeof s === 'number').length;
    const accuracy = maxScore > 0 ? (total / maxScore) * 100 : 0;

    if (accuracy >= 90) readingLabel = 'Fluent Reader';
    else if (accuracy >= 75) readingLabel = 'Transitional Reader';
    else if (accuracy >= 50) readingLabel = 'Developing Reader';

    onComplete({
      total,
      levelScores: updatedScores,
      levelLabel: readingLabel,
    });
  };

  const renderContent = () => {
    switch (currentLevel) {
      case null:
        return (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-center text-indigo-700 mb-4">
              Start Assessment
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Would you like to try a trial first or proceed directly to the assessment?
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleTryTrial}
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Try a Trial
              </button>
              <button
                onClick={handleStartAssessment}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Take Assessment
              </button>
            </div>
          </>
        );
      case 0:
        return (
          <TrialReadingTest
            onComplete={() => setCurrentLevel(1)}
            onClose={() => setCurrentLevel(null)}
          />
        );
      case 1:
        return <Level1 onComplete={(score) => handleLevelComplete('level1', score)} />;
      case 2:
        return <Level2 onComplete={(score) => handleLevelComplete('level2', score)} />;
      case 3:
        return <Level3 onComplete={(score) => handleLevelComplete('level3', score)} />;
      case 4:
        return (
          <div className="max-h-[80vh] overflow-y-auto">
            <Level4Story onComplete={() => setShowQuiz(true)} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {showQuiz ? (
        <Level4Quiz onComplete={(score) => handleQuizComplete(score)} />
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 sm:px-6">
          <div className="w-full sm:max-w-lg md:max-w-xl bg-white shadow-xl rounded-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-xl"
              title="Close"
            >
              ✖
            </button>
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
