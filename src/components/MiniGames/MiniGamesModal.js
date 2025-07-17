import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGamepad, FaTimes } from 'react-icons/fa';
import GameCard from './GameCard';
import JumbledLettersGame from './JumbledLetters/JumbledLettersGame';

export default function MiniGamesModal({ onClose }) {
  const [activeGame, setActiveGame] = useState(null);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('miniGameScores');
    if (stored) {
      setScores(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('miniGameScores', JSON.stringify(scores));
  }, [scores]);

  const handleGameComplete = (newEntry) => {
    setScores((prev) => [newEntry, ...prev]);
    setActiveGame(null);
  };

  const games = [
    {
      id: 'jumbled-letters',
      title: 'Jumbled Letters',
      description: 'Unscramble the letters to form a word!',
      icon: <FaGamepad size={32} className="text-[#398908]" />,
      component: (
        <JumbledLettersGame
          onExit={() => setActiveGame(null)}
          onComplete={handleGameComplete}
        />
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 min-h-screen">
      <AnimatePresence mode="wait">
        {activeGame ? (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white border-4 border-[#295A12] rounded-xl shadow-xl w-full max-w-2xl p-4 md:p-6"
          >
            <button
              onClick={() => setActiveGame(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              title="Close Game"
            >
              <FaTimes />
            </button>
            {games.find((g) => g.id === activeGame)?.component}
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="relative bg-[#F9FFF2] border-4 border-[#295A12] rounded-xl shadow-xl w-full max-w-5xl p-4 md:p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              title="Close"
            >
              <FaTimes />
            </button>

            <h3 className="text-2xl font-bold text-[#295A12] mb-4 flex items-center gap-2">
              <FaGamepad className="text-[#398908]" /> Mini Games
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    title={game.title}
                    description={game.description}
                    icon={game.icon}
                    onPlay={() => setActiveGame(game.id)}
                  />
                ))}
              </div>

              {/* Future scoreboard support */}
              {/* <div className="md:col-span-1">
                <Scoreboard scores={scores} />
              </div> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
