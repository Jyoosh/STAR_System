import React, { useEffect, useState, useCallback } from 'react';

// Question format: { cue: "...", answer: "..." }
const questions = [
  { cue: 'Put it on the table', answer: 'table' },
  { cue: 'Turn on the light', answer: 'light' },
  { cue: 'Wear your shoes', answer: 'shoes' },
  { cue: 'Close the door', answer: 'door' },
  { cue: 'Drink from the glass', answer: 'glass' },
  { cue: 'Get the book', answer: 'book' },
  { cue: 'Wash your hands', answer: 'hands' },
  { cue: 'Open the window', answer: 'window' },
  { cue: 'Play with the ball', answer: 'ball' },
  { cue: 'Sit on the chair', answer: 'chair' }
];

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function Level3_SD({ onComplete }) {
  const [shuffledQuestions] = useState(shuffleArray(questions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isAnswering, setIsAnswering] = useState(true);

  const current = shuffledQuestions[currentIndex];
  const jumbledLetters = shuffleArray(current.answer.toUpperCase().split('')).join(' ');

  const playCue = useCallback(() => {
    const utter = new SpeechSynthesisUtterance(current.cue);
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  }, [current]);

  const playCorrectSound = () => {
    const audio = new Audio('/assets/audio/sound_effects/ding.mp3');
    audio.play();
  };

  const playIncorrectSound = () => {
    const audio = new Audio('/assets/audio/sound_effects/incorrect.mp3');
    audio.play();
  };

  useEffect(() => {
    playCue();
  }, [playCue]);

  const handleSubmit = () => {
    if (!input.trim()) return;

    const isCorrect = input.trim().toLowerCase() === current.answer;

    if (isCorrect) {
      playCorrectSound();
      setScore(prev => prev + 1);
      setFeedback('✅ Correct!');
      setIsAnswering(false);
      setTimeout(goToNext, 1000);
    } else {
      playIncorrectSound();
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);

      if (remaining <= 0) {
        setFeedback(`❌ Incorrect. The answer was "${current.answer}".`);
        setIsAnswering(false);
        setTimeout(goToNext, 1000);
      } else {
        setFeedback('❌ Incorrect. Try again.');
      }
    }
  };

  const handleSkip = () => {
    setFeedback(`⏭️ Skipped. The answer was "${current.answer}".`);
    setIsAnswering(false);
    setTimeout(goToNext, 1000);
  };

  const goToNext = () => {
    setInput('');
    setFeedback(null);
    setAttemptsLeft(3);
    setIsAnswering(true);

    if (currentIndex + 1 < shuffledQuestions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      const passed = score === 10;
      onComplete(score, passed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-white to-green-200 bg-opacity-70 backdrop-blur-md transition-opacity duration-300"></div>
      <div className="relative z-10 w-full sm:max-w-lg md:max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-green-100 transition-all duration-300 ease-out max-h-[90vh] overflow-y-auto">

        <h2 className="text-xl sm:text-2xl font-bold text-center text-green-700 mb-2">
          Level 3: Jumbled Letters, Listen, and Type
        </h2>
        <p className="text-center text-gray-700 mb-4">
          Listen to the sentence. Then type the correct word using the jumbled letters.
        </p>

        <div className="flex justify-center mb-3">
          <button
            onClick={playCue}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔊 Start to Listen
          </button>
        </div>

        {/* 🧠 Sentence Cue Displayed as a Fill-in-the-Blank */}
        <p className="text-center text-lg font-medium text-gray-800 mb-3">
          {current.cue.replace(current.answer, '_____')}
        </p>

        {/* 🔡 Jumbled Letters */}
        <div className="text-center font-mono text-xl mb-4 text-gray-800 tracking-widest">
          {jumbledLetters}
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!isAnswering}
          placeholder="Type the word..."
          className="w-full border border-gray-300 px-4 py-2 rounded text-center"
        />

        {/* Feedback */}
        {feedback && (
          <div className="mt-4 text-center text-lg font-semibold text-gray-800">
            {feedback}
          </div>
        )}

        {/* Attempts */}
        <div className="text-center mt-2 text-sm text-gray-600">
          Attempts left: {attemptsLeft}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <button
            onClick={handleSubmit}
            disabled={!isAnswering}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit
          </button>
          <button
            onClick={handleSkip}
            disabled={!isAnswering}
            className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Skip
          </button>
        </div>

        <div className="mt-6 text-sm text-center text-gray-500">
          Question {currentIndex + 1} of 10
        </div>
      </div>
    </div>
  );
}
