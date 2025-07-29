// src/components/Assessment/Levels/Level3.js
import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import TooltipInfo from '../../common/TooltipInfo';

const dingSound = '/assets/audio/sound_effects/ding.mp3';
const incorrectSound = '/assets/audio/sound_effects/incorrect.mp3';

const ccvcWords = [
  { word: 'blog', context: 'Write a new ____ online.' },
  { word: 'club', context: 'He joined a reading ____.' },
  { word: 'flag', context: 'Wave the ____ in the air.' },
  { word: 'plan', context: 'We made a ____ for the trip.' },
  { word: 'shot', context: 'He took a ____ at the goal.' },
  { word: 'snap', context: 'Hear the stick ____ in two.' },
  { word: 'swim', context: 'Let’s ____ in the pool.' },
  { word: 'blur', context: 'It looked like a ____ on the screen.' },
  { word: 'clam', context: 'A ____ lives in a shell.' },
  { word: 'flop', context: 'The fish did a big ____.' }
];



export default function Level3({ onComplete }) {
  const [words, setWords] = useState([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('fill');
  const [filledLetters, setFilledLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState('');
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const recognitionRef = useRef(null);
  const countdownRef = useRef(null);
  const safeAttempts = Math.min(attempts, 3);

  const current = words[idx];

  useEffect(() => {
    const shuffled = ccvcWords.sort(() => Math.random() - 0.5).slice(0, 10);
    setWords(shuffled);
  }, []);

  useEffect(() => {
    if (current) {
      const blanks = current.word.split('').map(char => (/[aeiou]/i.test(char) ? '_' : char));
      const removedLetters = current.word
        .split('')
        .filter(char => /[aeiou]/i.test(char))
        .sort(() => Math.random() - 0.5);
      const fillers = removedLetters.concat(
        'abcdefghijklmnopqrstuvwxyz'.split('').sort(() => 0.5 - Math.random()).slice(0, 5)
      ).sort(() => Math.random() - 0.5);
      setFilledLetters(blanks);
      setAvailableLetters(fillers);
      setStatus('Choose the letters to fill in the blank');
      setPhase('fill');
      setAttempts(0);
    }
  }, [current]);

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play().catch(() => { });
  };

  const handleLetterClick = (letter) => {
    const newFilled = [...filledLetters];

    let toggled = false;
    for (let i = 0; i < newFilled.length; i++) {
      if (newFilled[i] === letter) {
        newFilled[i] = '_';
        toggled = true;
        break;
      }
    }

    if (!toggled) {
      for (let i = 0; i < newFilled.length; i++) {
        if (newFilled[i] === '_') {
          newFilled[i] = letter;
          break;
        }
      }
    }

    setFilledLetters(newFilled);

    const reconstructed = newFilled.join('');
    if (!reconstructed.includes('_')) {
      if (reconstructed.toLowerCase() === current.word.toLowerCase()) {
        setStatus('✅ Correct spelling! Now say the word.');
        setPhase('speak');
        setAttempts(0);
      } else {
        setStatus('❌ Incorrect combination. Adjust your letters.');
      }
    }
  };

  const beginListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setStatus('❌ Speech recognition not supported.');
      return;
    }

    if (countdownRef.current) clearInterval(countdownRef.current);

    let count = 3;
    setCountdown(count);
    setStatus('⏳ Get ready...');
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current);
        startSpeechRecognition();
      }
    }, 1000);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('🎧 Listening...');
    };

    recognition.onresult = e => {
      setIsListening(false);
      let heard = e.results[0][0].transcript.trim().toLowerCase();
      const expected = current.word.toLowerCase();

      // Remove repetition like "cloud cloud"
      const parts = heard.split(/\s+/);
      if (parts.length >= 2 && parts[0] === parts[1]) heard = parts[0];

      if (heard === expected) {
        const newScore = score + 1; // ✅ local variable
        setScore(newScore);
        setStatus(`✅ You said "${heard}"`);
        playSound(dingSound);
        setTimeout(() => {
          if (idx + 1 < words.length) {
            setIdx(prev => prev + 1);
          } else {
            setShowConfetti(true);
            setTimeout(() => onComplete(newScore, mistakes === 0), 1500); // ✅ use local value
          }
        }, 800);
      }

      else {
        const nextAttempt = attempts + 1;
        if (nextAttempt >= 3) {
          setStatus(`❌ Final attempt used. The word was "${expected}".`);
          playSound(incorrectSound);
          const finalMistakes = mistakes + 1;
          setMistakes(finalMistakes);
          setTimeout(() => {
            if (idx + 1 < words.length) {
              setIdx(prev => prev + 1);
            } else {
              setShowConfetti(true);
              setTimeout(() => onComplete(score, finalMistakes === 0), 1500); // ✅ correct value
            }
          }, 1000);
        } else {
          setAttempts(nextAttempt);
          setStatus(`❌ You said "${heard}". Try again (${nextAttempt}/3)`);
          playSound(incorrectSound);
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStatus('⚠️ Mic error. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const skipWord = () => {
    const finalMistakes = mistakes + 1;
    setMistakes(finalMistakes);
    setTimeout(() => {
      if (idx + 1 < words.length) {
        setIdx(prev => prev + 1);
      } else {
        setShowConfetti(true);
        setTimeout(() => onComplete(score, finalMistakes === 0), 1500); // ✅
      }
    }, 800);

  };

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {showConfetti && <Confetti numberOfPieces={300} recycle={false} gravity={0.4} />}
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
        <h2 className="text-2xl font-bold text-center">Level 3: Word Builders</h2>

        <div className="flex justify-center items-center gap-2 mb-2">
          <TooltipInfo
            title="Instructions"
            content={[
              'Fill in the missing vowels in the word.',
              'Once correct, say the word out loud.',
              'You have 3 lives for each word.',
              'After 3 incorrect tries, it skips to the next.',
              'Get all 10 correct to pass the level!',
            ]}
          />
          <span className="text-sm text-gray-600 text-center">Complete the word and say it clearly.</span>
        </div>

        <div className="text-center text-red-500 text-2xl">
          {"❤️".repeat(3 - safeAttempts)}{"🤍".repeat(safeAttempts)}
        </div>

        <p className="text-center text-gray-600">{current.context}</p>

        <div className="text-4xl text-center font-mono mb-2">
          {filledLetters.map((l, i) => (
            <span key={i} className="inline-block w-6">{l}</span>
          ))}
        </div>

        {phase === 'fill' && (
          <div className="flex flex-wrap justify-center gap-2">
            {availableLetters.map((ch, i) => (
              <button
                key={i}
                onClick={() => handleLetterClick(ch)}
                className="px-3 py-2 bg-indigo-200 rounded hover:bg-indigo-300"
              >
                {ch}
              </button>
            ))}
          </div>
        )}

        {phase === 'speak' && (
          <>
            <button
              onClick={beginListening}
              disabled={isListening || countdown > 0}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              {countdown > 0 ? `⏳ ${countdown}` : '🎤 Speak the Word'}
            </button>
            <button
              onClick={skipWord}
              className="w-full mt-2 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
            >
              ⏭️ Skip
            </button>
            {/* {isListening && (
              <div className="text-center text-blue-600 animate-pulse">🎧 Listening...</div>
            )} */}
          </>
        )}

        <div className="text-center mt-2 text-sm text-gray-700">{status}</div>
        <p className="text-sm text-gray-500 text-center">
          Word {idx + 1} of {words.length}
        </p>
      </div>
    </div>
  );
}
