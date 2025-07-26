import React, { useEffect, useRef, useState, useCallback } from 'react';
import Confetti from 'react-confetti';

const cvcWords = [
  { word: 'bag', context: 'Say "bag" as in "The bag is heavy."' },
  { word: 'bed', context: 'Say "bed" as in "I sleep in the bed."' },
  { word: 'kid', context: 'Say "kid" as in "The kid is playing."' },
  { word: 'log', context: 'Say "log" as in "The log is in the fire."' },
  { word: 'rub', context: 'Say "rub" as in "Rub your hands."' },
  { word: 'cat', context: 'Say "cat" as in "The cat is on the mat."' },
  { word: 'red', context: 'Say "red" as in "The apple is red."' },
  { word: 'win', context: 'Say "win" as in "I want to win the game."' },
  { word: 'cop', context: 'Say "cop" as in "The cop wears a badge."' },
  { word: 'tub', context: 'Say "tub" as in "I sit in the tub."' }
];

export default function Level2({ onComplete, debugAutoPass }) {
  const [words, setWords] = useState([]);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('Preparing...');
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [manualMode,] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const safeFailCount = Math.min(failCount, 3);

  const scoreRef = useRef(0);
  const wordsRef = useRef([]);
  const idxRef = useRef(0);
  const recognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const countdownRef = useRef(null);

  const dingSound = '/assets/audio/sound_effects/ding.mp3';
  const incorrectSound = '/assets/audio/sound_effects/incorrect.mp3';

  useEffect(() => {
    const shuffled = [...cvcWords].sort(() => 0.5 - Math.random()).slice(0, 10);
    setWords(shuffled);
    wordsRef.current = shuffled;
  }, []);

  const hasAutoPassedRef = useRef(false);

  const triggerAutoPass = useCallback(() => {
    if (hasAutoPassedRef.current) return;
    hasAutoPassedRef.current = true;
    setCompleted(true);
    setShowConfetti(true);
    setStatus('✅ Auto-passed for debug');
    setTimeout(() => {
      onComplete(10, true); // pass two separate arguments
    }, 1000);

  }, [onComplete]); // ⬅️ depends on onComplete only

  useEffect(() => {
    if (typeof debugAutoPass === 'function') {
      // Delay it to the next tick, so it doesn't fire during parent render
      setTimeout(() => {
        debugAutoPass(triggerAutoPass);
      }, 0);
    }
  }, [debugAutoPass, triggerAutoPass]);



  useEffect(() => {
    idxRef.current = idx;
    setTranscript('');
    setManualInput('');
    setFailCount(0);
  }, [idx]);

  const advance = useCallback(() => {
    const next = idxRef.current + 1;
    const totalItems = wordsRef.current.length;

    if (next < totalItems) {
      setIdx(next);
      setTranscript('');
      setFailCount(0);
      setStatus('Ready for next word.');
    } else {
      setCompleted(true);
      setShowConfetti(true);
      setStatus('🎉 Level complete!');
      const finalScore = scoreRef.current;
      const passed = finalScore === totalItems;
      setTimeout(() => onComplete(finalScore, passed), 1500);

    }
  }, [onComplete]);

  const startListening = () => {
    if (!recognitionRef.current || recognitionRunningRef.current) return;
    let cnt = 3;
    setCountdown(cnt);
    setStatus('⏳ Get ready...');
    countdownRef.current = setInterval(() => {
      cnt--;
      setCountdown(cnt);
      if (cnt <= 0) {
        clearInterval(countdownRef.current);
        setCountdown(0);
        try {
          recognitionRef.current.start();
          recognitionRunningRef.current = true;
          setListening(true);
          setStatus('🎧 Listening...');
        } catch {
          setStatus('⚠️ Mic error. Try again.');
        }
      }
    }, 1000);
  };

  const stopListening = () => {
    if (recognitionRunningRef.current && recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current.stop();
      recognitionRunningRef.current = false;
    }
    setListening(false);
    setStatus('🛑 Stopped');
  };

  const skipQuestion = () => {
    advance();
  };

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setStatus('❌ Speech Recognition not supported.');
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => recognitionRunningRef.current = true;
    recognition.onend = () => {
      recognitionRunningRef.current = false;
      setListening(false);
    };
    recognition.onerror = () => {
      recognitionRunningRef.current = false;
      setListening(false);
      setStatus('⚠️ Mic error.');
    };
    recognition.onresult = e => {
      if (completed) return;
      const raw = e.results[0][0].transcript.trim();
      const expected = wordsRef.current[idxRef.current]?.word;
      const correct = raw.toLowerCase().includes(expected);

      console.log('🗣️ Heard:', raw, '| 🎯 Expected:', expected);

      setTranscript(raw);
      setStatus('⏳ Processing...');

      setTimeout(() => {
        if (correct) {
          new Audio(dingSound).play();
          setScore(prev => {
            const updated = prev + 1;
            scoreRef.current = updated;
            return updated;
          });
          setStatus(`✅ Correct: "${raw}"`);
          advance();
        } else {
          const tries = failCount + 1;
          setFailCount(tries);
          new Audio(incorrectSound).play();
          setStatus(`❌ Try again (${tries}/3)`);
          if (tries >= 3) setTimeout(() => advance(), 1000);
        }
      }, 800);
    };

    recognitionRef.current = recognition;
    setStatus('✅ Ready to start');
  }, [failCount, advance, completed]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-6">
      {showConfetti && <Confetti numberOfPieces={300} recycle={false} gravity={0.4} />}
      <div className="w-full sm:max-w-lg md:max-w-xl bg-white shadow-xl rounded-lg space-y-4 p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-blue-700">Level 2: Sound Rangers</h2>

        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="relative group">
            <button className="text-blue-700 text-lg font-bold cursor-pointer" title="View instructions">ℹ️</button>
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-[300px] text-sm bg-white border border-gray-300 shadow-lg rounded p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <p><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside">
                <li>Say the word you see on screen.</li>
                <li>You have 3 lives for each word.</li>
                <li>After 3 incorrect attempts, it skips to the next word.</li>
                <li>Get all 10 correct to pass the level!</li>
              </ul>
            </div>
          </div>
          <span className="text-sm text-gray-600 text-center">Say each word clearly when it appears.</span>
        </div>


        {completed ? (
          <div className="text-center text-lg text-green-700">
            ✅ You finished! Your score: <strong>{score}</strong> out of <strong>{words.length}</strong>.
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600">Word {idx + 1} of {words.length}</p>
            <div className="text-4xl sm:text-5xl font-bold text-center text-indigo-700">{words[idx]?.word}</div>
            <p className="text-center text-gray-500">{words[idx]?.context}</p>

            {/* <div className="text-sm mt-2 mb-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={manualMode}
                  onChange={() => setManualMode(prev => !prev)}
                />
                For Those with Speech Defect Only
              </label>
            </div> */}

            <div className="text-center text-red-500 text-2xl">
              {"❤️".repeat(3 - safeFailCount)}{"🤍".repeat(safeFailCount)}
            </div>

            {!manualMode ? (
              <>
                <button onClick={startListening} disabled={listening || countdown > 0} className="w-full py-2 bg-green-600 text-white rounded">
                  {countdown > 0 ? `⏳ ${countdown}` : (listening ? '🎧 Listening…' : '🎤 Start Speaking')}
                </button>
                {listening && <button onClick={stopListening} className="w-full py-2 mt-2 bg-red-500 text-white rounded">🛑 Stop</button>}
              </>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Type the word"
                  className="w-full border rounded px-3 py-2"
                />
                <button
                  onClick={() => {
                    const expected = wordsRef.current[idxRef.current]?.word.toLowerCase();
                    const input = manualInput.trim().toLowerCase();
                    if (input === expected) {
                      new Audio(dingSound).play();
                      setScore(prev => {
                        const updated = prev + 1;
                        scoreRef.current = updated;
                        return updated;
                      });
                      advance();
                    } else {
                      new Audio(incorrectSound).play();
                      setStatus(`❌ Incorrect. It was "${expected}".`);
                      setTimeout(() => advance(), 1000);
                    }
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded"
                >
                  ✅ Submit
                </button>
              </div>
            )}

            <button onClick={skipQuestion} className="w-full py-2 bg-yellow-500 text-white rounded">⏭️ Skip Question</button>
            <pre className="text-xs text-gray-700 whitespace-pre-line mt-2">{status}</pre>
            {transcript && !manualMode && <p className="text-center text-gray-800 text-sm">You said: {transcript}</p>}
          </>
        )}
      </div>
    </div>
  );
}
