import React, { useState, useEffect } from 'react';
import { FaHeart, FaVolumeUp } from 'react-icons/fa';

const wordBank = ['apple', 'banana', 'orange', 'grape', 'lemon', 'mango', 'peach'];

function shuffle(word) {
  let arr = word.split('');
  do {
    arr.sort(() => Math.random() - 0.5);
  } while (arr.join('') === word); // avoid showing the correct word
  return arr.join('');
}

export default function JumbledLettersGame({ onExit, onComplete }) {
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);

  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    const newWord = wordBank[Math.floor(Math.random() * wordBank.length)];
    setWord(newWord);
    setScrambled(shuffle(newWord));
    setGuess('');
  };

  const handleSubmit = () => {
    if (guess.trim().toLowerCase() === word) {
      setScore((prev) => prev + 1);
      startNewRound();
    } else {
      setLives((prev) => {
        const updatedLives = prev - 1;
        if (updatedLives <= 0) finishGame();
        return updatedLives;
      });
    }
    setGuess('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    speechSynthesis.speak(utterance);
  };

  const finishGame = () => {
    onComplete({
      gameId: 'jumbled-letters',
      score: score,
      attempts: score + (3 - lives),
      date: new Date().toISOString(),
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 text-center space-y-4">
      <h2 className="text-2xl font-bold text-[#295A12]">Jumbled Letters</h2>

      <div className="text-xl font-mono tracking-widest text-[#398908]">
        {scrambled.toUpperCase()}
      </div>

      <div className="flex justify-center gap-2 text-xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <FaHeart key={i} className={i < lives ? 'text-red-500' : 'text-gray-300'} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your guess"
          className="border-2 border-[#295A12] px-4 py-2 rounded text-center w-52"
        />
        <button
          onClick={handleSubmit}
          className="bg-[#295A12] text-white px-4 py-2 rounded hover:bg-[#398908] w-full sm:w-auto"
        >
          Submit
        </button>
        <button
          onClick={playAudio}
          className="text-[#398908] hover:text-[#295A12] p-2"
          title="Hear the word"
        >
          <FaVolumeUp />
        </button>
      </div>

      <div className="text-gray-600 text-sm">
        Score: <strong>{score}</strong>
      </div>

      <div>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-[#C6E90E] text-[#295A12] rounded hover:bg-[#87DC3F] w-full sm:w-auto"
        >
          Exit Game
        </button>
      </div>
    </div>
  );
}
