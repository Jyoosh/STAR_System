import React, { useEffect, useRef, useState, useCallback } from 'react';
import Confetti from 'react-confetti';

const aliases = {
  A: ['ay', 'a'], B: ['bee', 'be'], C: ['see', 'sea'], D: ['dee', 'd'], E: ['ee', 'e'],
  F: ['ef', 'eff'], G: ['gee'], H: ['aitch', 'h'], I: ['eye', 'i'], J: ['jay'],
  K: ['kay'], L: ['el'], M: ['em'], N: ['en'], O: ['oh'], P: ['pee'],
  Q: ['queue', 'cue'], R: ['ar', 'are'], S: ['ess'], T: ['tee'],
  U: ['you', 'yew', 'u'], V: ['vee'], W: ['double you'], X: ['ex'],
  Y: ['why'], Z: ['zee', 'zed']
};


export default function Level1({ onComplete }) {
  const totalQuestions = 10;
  const [letters, setLetters] = useState([]);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('🔄 Preparing...');
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [hasAnyMistake, setHasAnyMistake] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const lettersRef = useRef([]);
  const idxRef = useRef(0);
  const recognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const countdownRef = useRef(null);

  const dingSound = '/assets/audio/sound_effects/ding.mp3';
  const incorrectSound = '/assets/audio/sound_effects/incorrect.mp3';

  const sampleWord = (letter) => {
    const examples = {
      A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Elephant',
      F: 'Fish', G: 'Goat', H: 'Hat', I: 'Igloo', J: 'Jam',
      K: 'Kite', L: 'Lion', M: 'Monkey', N: 'Nose', O: 'Orange',
      P: 'Pig', Q: 'Queen', R: 'Rabbit', S: 'Sun', T: 'Tiger',
      U: 'Umbrella', V: 'Violin', W: 'Whale', X: 'Xylophone',
      Y: 'Yak', Z: 'Zebra'
    };
    return examples[letter] || '';
  };

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play().catch((err) => console.warn('Sound error:', err));
  };

  // ✅ KEY FIX in this block:
  const advance = useCallback(() => {
    const next = idxRef.current + 1;
    if (next < lettersRef.current.length) {
      setIdx(next);
      setTranscript('');
      setFailCount(0);
      setStatus('🎙️ Ready for next letter');
    } else {
      setShowConfetti(true);
      setStatus('🎉 Level complete!');
      setCompleted(true);
      const passed = !hasAnyMistake;
      setTimeout(() => onComplete({ score, passed }), 1500); // ✅ send actual score and pass status
    }
  }, [onComplete, hasAnyMistake, score]);


  const skipQuestion = () => {
    setHasAnyMistake(true);
    advance();
  };

  useEffect(() => {
    const randomLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').sort(() => 0.5 - Math.random()).slice(0, totalQuestions);
    setLetters(randomLetters);
    lettersRef.current = randomLetters;
  }, []);

  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

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

    recognition.onerror = (event) => {
      setStatus(`⚠️ ${event.error}`);
      recognitionRunningRef.current = false;
      setListening(false);
    };

    recognition.onresult = (event) => {
      if (completed) return;
      const raw = event.results[0][0].transcript.trim();
      const heardWords = raw.split(/\s+/);
      const expected = lettersRef.current[idxRef.current];

      // 🔧 SAFE ALIAS HANDLING (handles both array or single string)
      const aliasList = Array.isArray(aliases[expected])
        ? aliases[expected]
        : [aliases[expected]].filter(Boolean);

      const accepted = [expected.toLowerCase(), ...aliasList.map(a => a.toLowerCase())];



      setTranscript(raw);
      setStatus('⏳ Processing...');

      let correctRepetitions = 0;
      for (const word of heardWords) {
        if (accepted.includes(word.toLowerCase())) correctRepetitions++;
      }

      setTimeout(() => {
        if (completed) return;

        if (correctRepetitions >= 1) {
          playSound(dingSound);
          setStatus(`✅ Correct: "${raw}"`);
          setScore(prev => prev + 1);
          setTimeout(() => advance(), 1000);
        } else {
          const tries = failCount + 1;
          setFailCount(tries);
          playSound(incorrectSound);
          setHasAnyMistake(true);

          if (tries >= 3) {
            setStatus(`❌ Incorrect 3 times. The letter was "${expected}".`);
            setTimeout(() => advance(), 3000);
          } else {
            setStatus(`❌ Heard "${raw}". Try again (${tries}/3).`);
          }
        }
      }, 1000);
    };

    recognitionRef.current = recognition;
    setStatus('✅ Ready to start');
  }, [failCount, advance, completed]);

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
        } catch (err) {
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

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-6">
      {showConfetti && <Confetti numberOfPieces={400} recycle={false} gravity={0.4} />}
      <div className="w-full sm:max-w-lg md:max-w-xl bg-white shadow-xl rounded-lg space-y-4 p-4 sm:p-6 md:p-8 relative">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-blue-700">Level 1: Alphabet Recognition</h2>

        {completed ? (
          <div className="text-center text-lg sm:text-xl text-green-700">
            ✅ You finished! Your score: <strong>{score}</strong> out of <strong>{letters.length}</strong>.
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 text-sm sm:text-base">
              Letter {idx + 1} of {letters.length}
            </p>

            <div className="text-6xl font-extrabold text-center text-indigo-700">
              {letters[idx]}
            </div>

            <p className="text-center text-gray-500 text-sm">
              Say: <strong>{letters[idx]} as in "{sampleWord(letters[idx])}"</strong>
            </p>
            <p className="text-center text-xs text-gray-500">You may speak 2 or more times in order for your voice to be recognized.</p>

            <button
              onClick={startListening}
              disabled={listening || countdown > 0}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              {countdown > 0 ? `⏳ ${countdown === 0 ? 'Speak now' : countdown}` : (listening ? '🎧 Listening…' : '🎤 Start Listening')}
            </button>

            {listening && (
              <button
                onClick={stopListening}
                className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                🛑 Stop
              </button>
            )}

            <button
              onClick={skipQuestion}
              className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              ⏭️ Skip Question
            </button>

            <pre className="text-xs text-gray-700 whitespace-pre-line mt-2">{status}</pre>

            {transcript && (
              <div className="text-center mt-2 text-gray-800 text-sm">
                <span className="font-semibold">You said:</span> {transcript}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
