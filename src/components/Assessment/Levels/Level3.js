// src/components/Assessment/Levels/Level3.js
import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';

const dingSound = '/assets/audio/sound_effects/ding.mp3';
const incorrectSound = '/assets/audio/sound_effects/incorrect.mp3';

const diphthongWords = [
  { word: 'sauce', context: 'tomato ____' },
  { word: 'saw', context: 'I ____ a bird' },
  { word: 'boat', context: 'the ____ floats' },
  { word: 'rain', context: 'falling ____' },
  { word: 'coat', context: 'winter ____' },
  { word: 'light', context: 'turn on the ____' },
  { word: 'night', context: 'good ____' },
  { word: 'brown', context: '____ bear' },
  { word: 'cloud', context: 'white ____' },
  { word: 'house', context: 'my ____' }
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

  const current = words[idx];

  useEffect(() => {
    const shuffled = diphthongWords.sort(() => Math.random() - 0.5).slice(0, 10);
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
    audio.play().catch(() => {});
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
        <h2 className="text-2xl font-bold text-center">Level 3: Fill and Recite</h2>
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
            {isListening && (
              <div className="text-center text-blue-600 animate-pulse">🎧 Listening...</div>
            )}
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
