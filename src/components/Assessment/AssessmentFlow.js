import React, { useState } from 'react';
import StartAssessmentModal from '../StartAssessmentModal';

const AssessmentFlow = () => {
  const [debugUnlocked, setDebugUnlocked] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [password, setPassword] = useState('');
  const [assessmentResult, setAssessmentResult] = useState(null);

  const unlockDebug = () => {
    if (password === '123') {
      setDebugUnlocked(true);
      console.log('[DEBUG] Debug mode unlocked');
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className="p-4 space-y-4 text-center">
      {!assessmentResult ? (
        <>
<StartAssessmentModal
  onClose={() => console.log('[DEBUG] Modal closed')}
  onComplete={(result) => {
    const normalizeScores = (raw) => {
      const extract = (x) => (typeof x === 'object' && x !== null ? x.score : x);
      return {
        level1: extract(raw.levelScores.level1),
        level2: extract(raw.levelScores.level2),
        level3: extract(raw.levelScores.level3),
        level4: extract(raw.levelScores.level4),
      };
    };

    const cleanedResult = {
      ...result,
      levelScores: normalizeScores(result)
    };

    setAssessmentResult(cleanedResult);
    console.log('[DEBUG] Assessment complete:', cleanedResult);
  }}
  debugAutoPass={debugMode}
/>


          {!debugUnlocked ? (
            <div className="mt-4">
              <input
                type="password"
                placeholder="Enter debug password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="border px-3 py-1 rounded"
              />
              <button
                onClick={unlockDebug}
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded"
              >
                Unlock Debug
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={debugMode}
                  onChange={() => {
                    setDebugMode(prev => !prev);
                    console.log(`[DEBUG] Debug Auto-Pass ${!debugMode ? 'enabled' : 'disabled'}`);
                  }}
                  className="mr-2"
                />
                Enable Debug Auto-Pass
              </label>
            </div>
          )}
        </>
      ) : (
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Assessment Finished</h2>
          <p className="text-lg font-semibold">
            Your Reading Level is <strong>{assessmentResult.levelLabel}</strong>!
          </p>
<ul className="my-4 text-left inline-block">
  <li>Level 1: {assessmentResult.levelScores.level1?.score ?? assessmentResult.levelScores.level1}/10</li>
  <li>Level 2: {assessmentResult.levelScores.level2?.score ?? assessmentResult.levelScores.level2}/10</li>
  <li>Level 3: {assessmentResult.levelScores.level3?.score ?? assessmentResult.levelScores.level3}/10</li>
  <li>Level 4: {assessmentResult.levelScores.level4?.score ?? assessmentResult.levelScores.level4}/10</li>
</ul>

          <h3 className="text-lg font-semibold">Total Score: {assessmentResult.total}</h3>

          <button
            onClick={() => setAssessmentResult(null)}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Restart Assessment
          </button>
        </div>
      )}
    </div>
  );
};

export default AssessmentFlow;
