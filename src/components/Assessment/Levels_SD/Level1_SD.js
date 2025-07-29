import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';
import TooltipInfo from '../../common/TooltipInfo';

const sampleWords = {
  A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Elephant',
  F: 'Fish', G: 'Goat', H: 'Hat', I: 'Igloo', J: 'Jam',
  K: 'Kite', L: 'Lion', M: 'Monkey', N: 'Nose', O: 'Orange',
  P: 'Pig', Q: 'Queen', R: 'Rabbit', S: 'Sun', T: 'Tiger',
  U: 'Umbrella', V: 'Violin', W: 'Whale', X: 'Xylophone',
  Y: 'Yak', Z: 'Zebra'
};

const getRandomLetters = (count) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.slice(0, count);
};

export default function Level1_SD({ onComplete, onExit }) {
  const [step, setStep] = useState('speech');
  const [speechLetters, setSpeechLetters] = useState([]);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('Click "Start to Listen" to hear the letter.');
  const [manualInput, setManualInput] = useState('');
  const [failCount, setFailCount] = useState(0);
  const [hasAnyMistake, setHasAnyMistake] = useState(false);
  const [score, setScore] = useState(0);
  const [matchPairs, setMatchPairs] = useState([]);
  const [matched, setMatched] = useState({});
  const [matchResults, setMatchResults] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  const dingSound = '/assets/audio/sound_effects/ding.mp3';
  const incorrectSound = '/assets/audio/sound_effects/incorrect.mp3';

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play().catch(() => { });
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const letters = getRandomLetters(5);
    setSpeechLetters(letters);
    const pairs = letters.map(letter => ({
      upper: letter,
      lower: letter.toLowerCase()
    }));
    setMatchPairs(pairs.sort(() => Math.random() - 0.5));
  }, []);

  const nextSpeech = () => {
    if (idx + 1 < speechLetters.length) {
      setIdx(idx + 1);
      setManualInput('');
      setFailCount(0);
      setStatus('Click start to hear the next letter.');
    } else {
      setStep('match');
    }
  };

  const handleSubmitManual = () => {
    const expected = speechLetters[idx];
    const userInput = manualInput.trim().toUpperCase();

    if (userInput === expected) {
      setScore(prev => prev + 1);
      playSound(dingSound);
      nextSpeech();
    } else {
      const nextFailCount = failCount + 1;
      setFailCount(nextFailCount);
      setHasAnyMistake(true);
      playSound(incorrectSound);

      if (nextFailCount >= 3) {
        setStatus(`❌ Incorrect. The answer was "${expected}".`);
        setTimeout(nextSpeech, 1200);
      } else {
        setStatus(`❌ Try again (${nextFailCount}/3)`);
      }
    }
  };


  const handleSkip = () => {
    setHasAnyMistake(true);
    nextSpeech();
  };

  const handleMatchSubmit = () => {
    const incomplete = matchPairs.some(pair => !matched[pair.upper]);
    if (incomplete) {
      toast.warning('Please complete all matches.');
      return;
    }

    let correctCount = 0;
    const results = {};
    let tempMistake = false;

    matchPairs.forEach(pair => {
      const selected = matched[pair.upper]?.toLowerCase();
      if (selected === pair.lower) {
        results[pair.upper] = 'correct';
        correctCount++;
      } else {
        results[pair.upper] = 'incorrect';
        tempMistake = true;
      }
    });

    const finalScore = score + correctCount;
    setScore(finalScore);
    setMatchResults(results);
    setHasAnyMistake(hasAnyMistake || tempMistake);

    const passed = !(hasAnyMistake || tempMistake);
    if (passed) setShowConfetti(true);

    setStep('done');
    setTimeout(() => {
      onComplete(finalScore, passed);
    }, 1500);
  };

  const renderHearts = () => {
    return (
      <div className="flex justify-center mb-2 space-x-1">
        {[0, 1, 2].map(i => (
          <span key={i} className="text-xl">
            {i < 3 - failCount ? '❤️' : '🤍'}
          </span>
        ))}
      </div>
    );
  };



  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-6">
      {showConfetti && <Confetti numberOfPieces={300} recycle={false} gravity={0.4} />}
      <div className="w-full sm:max-w-lg bg-white rounded-lg shadow-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-center text-blue-700">Level 1: Alphabeth Hunters</h2>

        <div className="flex justify-center items-center gap-2 mb-2">
          <TooltipInfo
            title="Instructions"
            content={[
              'Click ▶️ to listen for the letter.',
              'Type the letter you hear.',
              'You get 3 lives per letter.',
              'Then match upper to lowercase to finish.',
              'Get all correct to pass the level!',
            ]}
          />
          <span className="text-sm text-gray-600 text-center">
            Listen, type, and match to complete the level.
          </span>
        </div>


        {step === 'speech' && (
          <>
            {renderHearts()}
            <p className="text-center text-gray-600">Listen and type the letter you heard.</p>

            <button
              onClick={() => {
                const letter = speechLetters[idx];
                const word = sampleWords[letter];
                speak(`${letter}. As in ${word}`);
                setStatus(`📝 Listen Carefully and Type the Letter`);
              }}
              className="w-full py-2 bg-green-600 text-white rounded"
            >
              ▶️ Start to Listen
            </button>

            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Type the letter"
              className="w-full border rounded px-3 py-2 mt-3"
              maxLength={1}
            />

            <button onClick={handleSubmitManual} className="w-full py-2 bg-blue-600 text-white rounded">
              Submit
            </button>

            <button onClick={handleSkip} className="w-full py-2 bg-yellow-500 text-white rounded">
              Skip
            </button>

            <p className="text-sm text-center text-gray-700 mt-2">{status}</p>
          </>
        )}

        {step === 'match' && (
          <>
            <p className="text-center mb-2">Match uppercase with lowercase:</p>
            <div className="grid grid-cols-2 gap-4">
              {matchPairs.map(pair => (
                <div key={pair.upper} className="flex items-center justify-between border p-2">
                  <span className="font-bold text-indigo-700">{pair.upper}</span>
                  <select
                    className={`border rounded px-2 py-1 transition ${matchResults[pair.upper] === 'correct' ? 'bg-green-100' :
                      matchResults[pair.upper] === 'incorrect' ? 'bg-red-100' : ''
                      }`}
                    value={matched[pair.upper]?.toLowerCase() || ''}
                    onChange={(e) =>
                      setMatched(prev => ({ ...prev, [pair.upper]: e.target.value }))
                    }
                    disabled={step === 'done'}
                  >
                    <option value="">Select</option>
                    {matchPairs.map(p => (
                      <option key={p.lower} value={p.lower}>{p.lower}</option>
                    ))}
                  </select>
                  {matchResults[pair.upper] === 'correct' && <span className="text-green-600">✔️</span>}
                  {matchResults[pair.upper] === 'incorrect' && <span className="text-red-600">❌</span>}
                </div>
              ))}
            </div>

            <button
              onClick={handleMatchSubmit}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded"
            >
              ✅ Submit Matches
            </button>
          </>
        )}
      </div>
    </div>
  );
}
