import React, { useEffect, useRef, useState, useCallback } from 'react';
import Confetti from 'react-confetti';

const aliases = {
  A: ['ay', 'a'], B: ['bee', 'be'], C: ['see', 'sea'], D: ['dee', 'd'], E: ['ee', 'e'],
  F: ['ef', 'eff'], G: ['gee'], H: ['aitch', 'h'], I: ['eye', 'i'], J: ['jay'],
  K: ['kay'], L: ['el'], M: ['em'], N: ['en'], O: ['oh'], P: ['pee'], Q: ['queue', 'cue'],
  R: ['ar', 'are'], S: ['ess'], T: ['tee'], U: ['you', 'yew', 'u'], V: ['vee'],
  W: ['double you'], X: ['ex'], Y: ['why'], Z: ['zee', 'zed']
};

export default function TrialReadingTest({ onClose }) {
  const [letters, setLetters] = useState([]);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('🔄 Preparing...');
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [failCount, setFailCount] = useState(0); // Tracks failed attempts
  const [hasPlayed, setHasPlayed] = useState(false);
  const [animation, setAnimation] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);

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

  const advance = useCallback(() => {
    const next = idxRef.current + 1;
    if (next < lettersRef.current.length) {
      setIdx(next);
      setTranscript('');
      setFailCount(0); // Reset fail count for the next letter
      setStatus('🎙️ Ready for next letter');
    } else {
      setShowConfetti(true);
      setStatus('🎉 Trial complete!');
      setCompleted(true);
    }
  }, []);

  const skipToResults = () => {
    setCompleted(true);
    setShowConfetti(true);
    setStatus('🎉 Skipped to results.');
  };

  useEffect(() => {
    const randomLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').sort(() => 0.5 - Math.random()).slice(0, 5);
    setLetters(randomLetters);
    lettersRef.current = randomLetters;
  }, []);

  useEffect(() => {
    idxRef.current = idx;
    setHasPlayed(false);
    setFailCount(0);
    setAnimation('');
    setTranscript('');
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
      setStatus('🎧 Listening… Please say the letter and wait.'); // Update status to indicate listening
    };

    recognition.onerror = (event) => {
      setStatus(`⚠️ ${event.error}`);
      recognitionRunningRef.current = false;
      setListening(false);
    };

    recognition.onresult = (event) => {
      if (completed) return;

      const raw = event.results[0][0].transcript.trim();
      const heardWords = raw.split(/\s+/); // Split transcript by spaces into individual words
      const expected = lettersRef.current[idxRef.current];
      const accepted = [expected.toLowerCase(), ...(aliases[expected] || []).map(a => a.toLowerCase())];

      setTranscript(raw);
      setStatus('⏳ Processing...');

      // Count how many times the user said the correct letter (or alias)
      let correctRepetitions = 0;
      for (const word of heardWords) {
        const normalizedWord = word.toLowerCase();
        if (accepted.includes(normalizedWord)) {
          correctRepetitions++;
        }
      }

      setTimeout(() => {
        if (completed) return;

        if (correctRepetitions >= 1) { // Accept if at least one correct utterance is detected
          playSound(dingSound);
          setStatus(`✅ Correct: "${raw}" (Detected ${correctRepetitions} correct repetitions)`);
          setScore((prev) => prev + 1);
          setAnimation('animate-bounce');
          setTimeout(() => {
            setAnimation('');
            advance();
          }, 1000);
        } else {
          const tries = failCount + 1;
          setFailCount(tries);
          playSound(incorrectSound);
          setAnimation('animate-shake');

          if (tries >= 3) {
            const word = sampleWord(expected);
            setStatus(`❌ Incorrect 3 times. Say "${expected}" like "${word}".`);
            setTimeout(() => {
              setAnimation('');
              advance(); // Automatically proceed after 3 incorrect attempts
            }, 3000);
          } else {
            setStatus(`❌ Heard "${raw}". Try again (${tries}/3).`);
            setTimeout(() => setAnimation(''), 1000);
          }
        }
      }, 1000);
    };

    recognitionRef.current = recognition;
    setStatus('✅ Ready to start');
  }, [failCount, advance, completed]);

  // Speech synthesis voice loader
  useEffect(() => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      setSpeechReady(true);
    } else {
      speechSynthesis.onvoiceschanged = () => {
        setSpeechReady(true);
      };
    }
  }, []);

  const startListening = () => {
    if (!speechReady) {
      setStatus('🧠 Initializing speech synthesis… Please wait.');
      return;
    }

    if (!recognitionRef.current || recognitionRunningRef.current) return;

    const beginCountdown = () => {
      let count = 3;
      setCountdown(count);
      setStatus('⏳ Get ready to speak...');
      countdownRef.current = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(countdownRef.current);
          setStatus('🎤 Speak now!');
          setTimeout(() => {
            try {
              speechSynthesis.cancel();
              recognitionRef.current.start();
              recognitionRunningRef.current = true;
              setListening(true);
              setStatus('🎧 Listening… Please say the letter and wait.');
            } catch (err) {
              setStatus('⚠️ Mic error. Try again.');
            }
          }, 500);
        }
      }, 1000);
    };

    if (!hasPlayed) {
      speakLetter(beginCountdown);
    } else {
      beginCountdown();
    }
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

  const speakLetter = (onDone) => {
    if (!speechReady) {
      setStatus('🧠 Initializing speech synthesis… Please wait.');
      if (typeof onDone === 'function') onDone();
      return;
    }

    if (hasPlayed) {
      if (typeof onDone === 'function') onDone();
      return;
    }

    const letter = letters[idx];
    const word = sampleWord(letter);
    const utter = new SpeechSynthesisUtterance(`${letter}, as in ${word}`);
    utter.lang = 'en-US';
    utter.pitch = 1.2;
    utter.rate = 1;

    const voices = speechSynthesis.getVoices();
    const lively = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
    if (lively) utter.voice = lively;

    utter.onend = () => {
      setHasPlayed(true);
      setStatus('🕒 Get ready to speak…');
      if (typeof onDone === 'function') onDone();
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-6">
      {showConfetti && <Confetti numberOfPieces={400} recycle={false} gravity={0.4} />}
      <div className="w-full sm:max-w-lg md:max-w-xl bg-white shadow-xl rounded-lg space-y-4 p-4 sm:p-6 md:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
          title="Exit trial"
        >
          ✖
        </button>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-blue-700">🧪 Alphabet Trial</h2>

        {completed ? (
          <div className="text-center text-lg sm:text-xl text-green-700">
            ✅ You finished! Your score: <strong>{score}</strong> out of <strong>{letters.length}</strong>.
            <button
              onClick={onClose}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              🎉 Finish
            </button>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 text-sm sm:text-base">
              Letter {idx + 1} of {letters.length}
            </p>

            <div className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-center text-indigo-700 ${animation}`}>
              {letters[idx]}
            </div>

            <div className="text-center text-gray-500 text-sm sm:text-base">
              Say: <strong>{letters[idx]} as in "{sampleWord(letters[idx])}"</strong>
            </div>

            <div className="text-center text-gray-500 text-sm sm:text-base">
              Attempt: <strong>{Math.min(failCount + 1, 3)} of 3</strong>
            </div>

            <button
              onClick={startListening}
              disabled={listening || countdown > 0}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-base sm:text-lg"
            >
              {countdown > 0 ? `⏳ ${countdown}` : (listening ? '🎧 Listening…' : '🎤 Start Listening')}
            </button>

            {listening && (
              <button
                onClick={stopListening}
                className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-base sm:text-lg"
              >
                🛑 Stop
              </button>
            )}

            {!hasPlayed && (
              <button
                onClick={speakLetter}
                className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-base sm:text-lg"
              >
                🔊 Hear How to Say It
              </button>
            )}

            {idx < letters.length - 1 && (
              <button
                onClick={advance}
                className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-base sm:text-lg"
              >
                ⏭️ Skip Letter
              </button>
            )}

            {idx === letters.length - 1 && (
              <button
                onClick={skipToResults}
                className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-base sm:text-lg"
              >
                ⏩ Skip to Results
              </button>
            )}

            <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-line mt-2">{status}</pre>

            {transcript && (
              <div className="text-center mt-2 text-gray-800 text-sm sm:text-base">
                <span className="font-semibold">You said:</span> {transcript}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
