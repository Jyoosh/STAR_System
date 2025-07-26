import React, { useEffect, useState, useCallback } from 'react';

const wordList = [
  "bag", "bed", "kid", "log", "rub", "cat", "red", "win", "cop", "tub"
];
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function Level2_SD({ onComplete }) {
  const [words] = useState(shuffle([...wordList]));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isAnswering, setIsAnswering] = useState(true);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const correctSound = new Audio('/assets/audio/sound_effects/ding.mp3');
  const incorrectSound = new Audio('/assets/audio/sound_effects/incorrect.mp3');

  const currentWord = words[currentIndex];

  const playWord = useCallback(() => {
    const utter = new SpeechSynthesisUtterance(currentWord);
    utter.rate = 0.8;
    window.speechSynthesis.speak(utter);
  }, [currentWord]);

  useEffect(() => {
    playWord();
  }, [playWord]);

  const handleSubmit = () => {
    if (!input.trim()) return;

    const isCorrect = input.trim().toLowerCase() === currentWord;

    if (isCorrect) {
      correctSound.play();
      setScore(prev => prev + 1);
      setFeedback('✅ Correct!');
      setIsAnswering(false);
      setTimeout(() => goToNext(true), 1000);
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);

      if (remaining <= 0) {
        incorrectSound.play();
        setFeedback(`❌ Incorrect. The word was "${currentWord}"`);
        setIsAnswering(false);
        setTimeout(() => goToNext(false), 1000);
      } else {
        incorrectSound.play();
        setFeedback('❌ Incorrect. Try again.');
      }
    }
  };

  const handleSkip = () => {
    incorrectSound.play();
    setFeedback(`⏭️ Skipped. The word was "${currentWord}"`);
    setIsAnswering(false);
    setTimeout(() => goToNext(false), 1000);
  };

  const goToNext = (wasCorrect) => {
    setInput('');
    setFeedback(null);
    setIsAnswering(true);
    setAttemptsLeft(3);

    if (currentIndex + 1 < words.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      const finalScore = wasCorrect ? score + 1 : score;
      const passed = finalScore === 10;
      onComplete(finalScore, passed);
    }
  };

  const renderHearts = () => (
    <div className="flex justify-center mb-4 space-x-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="text-xl">
          {i < attemptsLeft ? '❤️' : '🤍'}
        </span>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-white to-green-200 bg-opacity-70 backdrop-blur-md transition-opacity duration-300"></div>
      <div className="relative z-10 w-full sm:max-w-lg md:max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-green-100 transition-all duration-300 ease-out max-h-[90vh] overflow-visible">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-green-700 mb-2">
          Level 2: CVC Words
        </h2>

        <div className="flex justify-center items-center gap-2 mb-4 relative z-20">
          <div className="relative group">
            <button
              className="text-green-700 text-lg font-bold cursor-pointer"
              title="View instructions"
            >
              ℹ️
            </button>
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-[300px] text-sm bg-white border border-gray-300 shadow-lg rounded p-3 opacity-0 group-hover:opacity-100 transition-opacity z-50">
              <p><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside">
                <li>Click 🔊 to listen to a CVC word.</li>
                <li>Type exactly what you hear.</li>
                <li>You get 3 lives per word.</li>
                <li>Try not to skip. Get all 10 correct to pass!</li>
              </ul>
            </div>
          </div>
          <span className="text-sm text-gray-600 text-center">
            Listen and type each word to complete the level.
          </span>
        </div>

        {isAnswering && renderHearts()}

        <p className="text-center text-gray-700 mb-4">
          Listen to the word. Type what you hear.
        </p>

        <div className="flex justify-center mb-4">
          <button
            onClick={playWord}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔊 Start to Listen
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={!isAnswering}
            placeholder="Type the word..."
            className="w-full border border-gray-300 px-4 py-2 rounded text-center"
          />
        </div>

        {feedback && (
          <div className="mb-2 text-lg font-semibold text-center text-gray-800">
            {feedback}
          </div>
        )}

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
