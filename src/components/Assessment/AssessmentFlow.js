import React, { useState } from 'react';
import StartAssessmentModal from '../StartAssessmentModal';
import Level1 from './Levels/Level1';
import Level2 from './Levels/Level2';
import Level3 from './Levels/Level3';
import Level4Story from './Levels/Level4Story';
import Level4Quiz from './Levels/Level4Quiz';

const AssessmentFlow = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [scores, setScores] = useState({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
  });

  const handleLevelComplete = (levelKey, score) => {
    // store the score
    setScores(s => ({ ...s, [levelKey]: score }));
    // advance to the next level
    setCurrentLevel(cl => cl + 1);
  };

  // Render Start modal at level 0
  if (currentLevel === 0) {
    return (
      <StartAssessmentModal
        onStart={() => setCurrentLevel(1)}
      />
    );
  }

  // Levels 1–3
  if (currentLevel === 1) {
    return <Level1 onComplete={score => handleLevelComplete('level1', score)} />;
  }
  if (currentLevel === 2) {
    return <Level2 onComplete={score => handleLevelComplete('level2', score)} />;
  }
  if (currentLevel === 3) {
    return <Level3 onComplete={score => handleLevelComplete('level3', score)} />;
  }

  // Level 4 has two parts: story then quiz
  if (currentLevel === 4) {
    return <Level4Story onContinue={() => setCurrentLevel(5)} />;
  }
  if (currentLevel === 5) {
    return <Level4Quiz onComplete={score => handleLevelComplete('level4', score)} />;
  }

  // After all 4 levels
  if (currentLevel === 6) {
    const total = scores.level1 + scores.level2 + scores.level3 + scores.level4;
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Assessment Complete!</h2>
        <ul className="mb-4">
          <li>Level 1: {scores.level1}/10</li>
          <li>Level 2: {scores.level2}/10</li>
          <li>Level 3: {scores.level3}/10</li>
          <li>Level 4: {scores.level4}/5</li>
        </ul>
        <h3 className="text-xl">Total Score: {total}</h3>
        {/* optionally trigger a “Finish” button here */}
      </div>
    );
  }

  return null;
};

export default AssessmentFlow;
