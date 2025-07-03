import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-4">Welcome to STAR</h2>
      <p className="mb-6">Begin assessing student reading levels or review previous results.</p>
      <div className="space-x-4">
        <Link to="/assessment" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Start Assessment</Link>
        <Link to="/dashboard" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">View Dashboard</Link>
      </div>
    </div>
  );
}
