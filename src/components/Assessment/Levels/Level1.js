import React, { useEffect, useRef, useState, useCallback } from 'react';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';


const aliases = {
  A: ['ay', 'a'], B: ['bee', 'be'], C: ['see', 'sea'], D: ['dee', 'd'], E: ['ee', 'e'],
  F: ['ef', 'eff'], G: ['gee'], H: ['aitch', 'h'], I: ['eye', 'i'], J: ['jay'],
  K: ['kay'], L: ['el'], M: ['em'], N: ['en'], O: ['oh'], P: ['pee'],
  Q: ['queue', 'cue'], R: ['ar', 'are'], S: ['ess'], T: ['tee'],
  U: ['you', 'yew', 'u'], V: ['vee'], W: ['double you'], X: ['ex'],
  Y: ['why'], Z: ['zee', 'zed']
};

const getRandomLetters = (count) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.slice(0, count);
};

export default function Level1({ onComplete }) {
  const [step, setStep] = useState('speech');
  const [speechLetters, setSpeechLetters] = useState([]);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('Preparing...');
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [score, setScore] = useState(0);
const [hasAnyMistake, setHasAnyMistake] = useState(false); // fix destructuring
  const [countdown, setCountdown] = useState(0);
  const [showConfetti] = useState(false);
  const [matchPairs, setMatchPairs] = useState([]);
  const [matched, setMatched] = useState({});
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [matchResults] = useState({});



  const lettersRef = useRef([]);
  const idxRef = useRef(0);
  const recognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const countdownRef = useRef(null);

  const dingSound = '/assets/audio/sound_effects/ding.mp3';
  const incorrectSound = '/assets/audio/sound_effects/incorrect.mp3';

  useEffect(() => {
    const letters = getRandomLetters(5);
    setSpeechLetters(letters);
    lettersRef.current = letters;
    const pairs = letters.map(letter => ({
      upper: letter,
      lower: letter.toLowerCase(),
    }));
    setMatchPairs(pairs.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  // const sampleWord = (letter) => {
  //   const examples = {
  //     A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Elephant',
  //     F: 'Fish', G: 'Goat', H: 'Hat', I: 'Igloo', J: 'Jam',
  //     K: 'Kite', L: 'Lion', M: 'Monkey', N: 'Nose', O: 'Orange',
  //     P: 'Pig', Q: 'Queen', R: 'Rabbit', S: 'Sun', T: 'Tiger',
  //     U: 'Umbrella', V: 'Violin', W: 'Whale', X: 'Xylophone',
  //     Y: 'Yak', Z: 'Zebra'
  //   };
  //   return examples[letter] || '';
  // };

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play().catch(() => {});
  };

  // const allMatched = matchPairs.every(pair => matched[pair.upper]);

  const nextSpeech = useCallback(() => {
    if (idxRef.current + 1 < speechLetters.length) {
      setIdx(idxRef.current + 1);
      setTranscript('');
      setManualInput('');
      setFailCount(0);
      setStatus('Next letter ready.');
    } else {
      setStep('match');
    }
  }, [speechLetters.length]);

  const startListening = () => {
    if (!recognitionRef.current || recognitionRunningRef.current) return;
    let count = 3;
    setCountdown(count);
    setStatus('⏳ Get ready...');
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current);
        setCountdown(0);
        try {
          recognitionRef.current.start();
          recognitionRunningRef.current = true;
          setListening(true);
          setStatus('🎧 Speak now!');
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
    setHasAnyMistake(true);
    nextSpeech();
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('❌ Speech Recognition not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      recognitionRunningRef.current = true;
    };

    recognition.onend = () => {
      recognitionRunningRef.current = false;
      setListening(false);
    };

    recognition.onerror = () => {
      setStatus(`⚠️ Error`);
      recognitionRunningRef.current = false;
      setListening(false);
    };

    recognition.onresult = (event) => {
      const raw = event.results[0][0].transcript.trim();
      const heardWords = raw.split(/\s+/);
      const expected = lettersRef.current[idxRef.current];
      const accepted = [expected.toLowerCase(), ...(aliases[expected] || []).map(x => x.toLowerCase())];

      setTranscript(raw);
      let correct = heardWords.some(word => accepted.includes(word.toLowerCase()));
      setTimeout(() => {
        if (correct) {
          playSound(dingSound);
          setScore(prev => prev + 1);
          nextSpeech();
        } else {
          const tries = failCount + 1;
          setFailCount(tries);
          playSound(incorrectSound);
          setHasAnyMistake(true);
          if (tries >= 3) {
            setStatus(`❌ Incorrect 3 times. It was "${expected}".`);
            setTimeout(() => nextSpeech(), 1000);
          } else {
            setStatus(`❌ Try again (${tries}/3).`);
          }
        }
      }, 500);
    };

    recognitionRef.current = recognition;
    setStatus('Ready to start.');
  }, [failCount, nextSpeech]);

  // const restart = () => window.location.reload();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-6">
      {showConfetti && <Confetti numberOfPieces={300} recycle={false} gravity={0.4} />}
      <div className="w-full sm:max-w-lg md:max-w-xl bg-white shadow-xl rounded-lg space-y-4 p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-blue-700">Level 1: Alphabet Recognition</h2>

        {step === 'speech' && (
          <>
            {/* <p className="text-center text-gray-600">Say the letter:</p>
            <div className="text-6xl font-bold text-center text-indigo-700">{speechLetters[idx]}</div>
            <p className="text-center text-gray-500">Example: {speechLetters[idx]} as in "{sampleWord(speechLetters[idx])}"</p> */}

<p className="text-center text-gray-600">Say the letter:</p>
<div className="text-6xl font-bold text-center text-indigo-700">{speechLetters[idx]}</div>

            <div className="text-sm mt-2 mb-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={manualMode}
                  onChange={() => setManualMode(prev => !prev)}
                />
                For Those with Speech Defect Only
              </label>
            </div>

            {!manualMode ? (
              <>
                <button onClick={startListening} disabled={listening || countdown > 0} className="w-full py-2 bg-green-600 text-white rounded">
                  {countdown > 0 ? `⏳ ${countdown}` : (listening ? '🎧 Listening…' : '🎤 Start Listening')}
                </button>
                {listening && <button onClick={stopListening} className="w-full py-2 bg-red-500 text-white rounded">🛑 Stop</button>}
              </>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Type the letter"
                  className="w-full border rounded px-3 py-2"
                />
                <button
                  onClick={() => {
                    const expected = lettersRef.current[idxRef.current];
                    const accepted = [expected.toLowerCase(), ...(aliases[expected] || []).map(x => x.toLowerCase())];
                    if (accepted.includes(manualInput.trim().toLowerCase())) {
                      playSound(dingSound);
                      setScore(prev => prev + 1);
                      nextSpeech();
                    } else {
                      playSound(incorrectSound);
                      setHasAnyMistake(true);
                      setStatus(`❌ Incorrect. It was "${expected}".`);
                      setTimeout(() => nextSpeech(), 1000);
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
            {transcript && !manualMode && <div className="text-center text-gray-800 text-sm">You said: {transcript}</div>}
          </>
        )}

        {step === 'match' && (
  <div>
    <p className="text-center mb-2">Match uppercase with lowercase:</p>
    <div className="grid grid-cols-2 gap-4 mt-4">
      {matchPairs.map(pair => (
        <div key={pair.upper} className="flex justify-between items-center border p-2">
          <span className="text-xl font-bold text-indigo-700">{pair.upper}</span>
<select
  className={`border rounded px-2 py-1 transition
    ${matchResults[pair.upper] === 'correct' ? 'border-green-500 bg-green-100' : ''}
    ${matchResults[pair.upper] === 'incorrect' ? 'border-red-500 bg-red-100' : ''}`}
  value={matched[pair.upper]?.toLowerCase() || ''}
  onChange={(e) =>
    setMatched(prev => ({
      ...prev,
      [pair.upper]: e.target.value,
    }))
  }
  disabled={step === 'done'}
>
            <option value="">Select</option>
            {matchPairs.map(p => (
              <option key={p.lower} value={p.lower}>{p.lower}</option>
            ))}
          </select>
          {matchResults[pair.upper] === 'correct' && <span className="ml-2 text-green-600 text-xl">✔️</span>}
{matchResults[pair.upper] === 'incorrect' && <span className="ml-2 text-red-600 text-xl">❌</span>}
        </div>
      ))}
    </div>

    <button
onClick={() => {
  const incomplete = matchPairs.some(pair => !matched[pair.upper]);
if (incomplete) {
  toast.warning('Please select all matches before submitting.', {
    position: 'top-center',
    autoClose: 3000,
  });
  return;
}


  const newResults = {};
  let correctCount = 0;
  let tempMistake = false;

  matchPairs.forEach(pair => {
    const selected = matched[pair.upper]?.toLowerCase();
    const isCorrect = selected === pair.lower;
    newResults[pair.upper] = isCorrect ? 'correct' : 'incorrect';
    if (isCorrect) correctCount++;
    else tempMistake = true;
  });

const finalScore = score + correctCount;
setScore(finalScore); // properly update score
setHasAnyMistake(tempMistake);
setStep('done');
const passed = !(hasAnyMistake || tempMistake);
setTimeout(() => onComplete({ score: finalScore, passed }), 2500);


}}
      className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      ✅ Submit Matches
    </button>
  </div>
)}
      </div>
    </div>
  );
}
