// src/components/MiniGames/Scoreboard.js
import React from 'react';

export default function Scoreboard({ scores }) {
  return (
    <div className="bg-white border border-[#87DC3F] rounded-lg p-4 shadow-sm max-h-60 overflow-y-auto">
      <h4 className="text-lg font-semibold text-[#295A12] mb-2">Scoreboard</h4>
      {scores.length === 0 ? (
        <p className="text-gray-600 text-sm">No games played yet.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {scores.map(({ gameId, attempts, score, date }, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{gameId === 'jumbled-letters' ? 'Jumbled Letters' : gameId}</span>
              <span>
                {score} pts&nbsp;|&nbsp;{attempts} tries&nbsp;|&nbsp;
                {new Date(date).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
