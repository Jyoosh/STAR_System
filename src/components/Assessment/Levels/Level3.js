import React, { useEffect, useRef, useState, useCallback } from 'react';
import Confetti from 'react-confetti';

const diphthongWords = [
  { word: 'sauce', context: 'Say "sauce" as in "tomato sauce".' },
  { word: 'saw', context: 'Say "saw" as in "I saw a bird".' },
  { word: 'boat', context: 'Say "boat" as in "the boat floats".' },
  { word: 'rain', context: 'Say "rain" as in "falling rain".' },
  { word: 'coat', context: 'Say "coat" as in "winter coat".' },
  { word: 'light', context: 'Say "light" as in "turn on the light".' },
  { word: 'night', context: 'Say "night" as in "good night".' },
  { word: 'brown', context: 'Say "brown" as in "brown bear".' },
  { word: 'cloud', context: 'Say "cloud" as in "white cloud".' },
  { word: 'house', context: 'Say "house" as in "my house".' }
];

export default function Level3({ onComplete }) {
  const [words, setWords] = useState([]);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('🔄 Preparing...');
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [animation, setAnimation] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);

  const wordsRef = useRef([]);
  const idxRef = useRef(0);
  const recognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const countdownRef = useRef(null);

  const dingSound = '/assets/audio/sound_effects/ding.mp3';
  const incorrectSound = '/assets/audio/sound_effects/incorrect.mp3';

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play().catch((err) => console.warn('Sound error:', err));
  };

  const advance = useCallback(() => {
    const next = idxRef.current + 1;
    if (next < wordsRef.current.length) {
      setIdx(next);
      setTranscript('');
      setFailCount(0);
      setStatus('🎙️ Ready for next word');
    } else {
      setShowConfetti(true);
      setStatus('🎉 Level complete!');
      setCompleted(true);
      setTimeout(() => {
        onComplete(score);
      }, 1500);
    }
  }, [onComplete, score]);

  useEffect(() => {
    const shuffledWords = diphthongWords.sort(() => 0.5 - Math.random()).slice(0, 10);
    setWords(shuffledWords);
    wordsRef.current = shuffledWords;
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
      setStatus('🎧 Listening… Please say the word and wait.');
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
      const currentWord = wordsRef.current[idxRef.current];

      if (!currentWord) {
        setStatus('⚠️ No word to recognize.');
        return;
      }

      const expected = currentWord.word.toLowerCase();
      const accepted = [expected]; // Strict matching - only accept exact word

      setTranscript(raw);
      setStatus('⏳ Processing...');

      let correctRepetitions = 0;
      for (const word of heardWords) {
        if (accepted.includes(word.toLowerCase())) {
          correctRepetitions++;
        }
      }

      setTimeout(() => {
        if (completed) return;

        if (correctRepetitions >= 1) {
          playSound(dingSound);
          setStatus(`✅ Correct: "${raw}"`);
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
            setStatus(`❌ Incorrect 3 times. Say "${expected}".`);
            setTimeout(() => {
              setAnimation('');
              advance();
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
              setStatus('🎧 Listening… Please say the word and wait.');
            } catch (err) {
              setStatus('⚠️ Mic error. Try again.');
            }
          }, 500);
        }
      }, 1000);
    };

    if (!hasPlayed) {
      speakWord(beginCountdown);
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

  const speakWord = (onDone) => {
    if (!speechReady) {
      setStatus('🧠 Initializing speech synthesis… Please wait.');
      if (typeof onDone === 'function') onDone();
      return;
    }

    if (hasPlayed) {
      if (typeof onDone === 'function') onDone();
      return;
    }

    const word = words[idx].word;
    const utter = new SpeechSynthesisUtterance(word);
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
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-blue-700">Level 3: Diphthongs & Silent Letters</h2>

        {completed ? (
          <div className="text-center text-lg sm:text-xl text-green-700">
            ✅ You finished! Your score: <strong>{score}</strong> out of <strong>{words.length}</strong>.
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 text-sm sm:text-base">
              Word {idx + 1} of {words.length}
            </p>

            <div className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-center text-indigo-700 ${animation}`}>
              {words[idx] ? words[idx].word : 'Loading...'}
            </div>

            <div className="text-center text-gray-500 text-sm sm:text-base">
              {words[idx] ? words[idx].context : 'Loading...'}
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
                onClick={speakWord}
                className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-base sm:text-lg"
              >
                🔊 Hear How to Say It
              </button>
            )}

            {idx < words.length - 1 && (
              <button
                onClick={advance}
                className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-base sm:text-lg"
              >
                ⏭️ Skip Word
              </button>
            )}

            {idx === words.length - 1 && (
              <button
                onClick={advance}
                className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-base sm:text-lg"
              >
                ⏩ Finish Level
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
