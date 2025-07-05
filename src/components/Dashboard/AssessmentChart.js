import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AssessmentChart({ history }) {
  if (!history || history.length === 0) return null;

  const chartData = history.map((entry) => ({
    date: new Date(entry.assessed_at).toLocaleDateString(),
    accuracy: entry.accuracy,
    total_score: entry.total_score,
    level4_score: entry.level4_score,
  })).reverse(); // recent to oldest

  return (
    <div className="mt-8 bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4">Progress Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="accuracy" stroke="#6366F1" strokeWidth={2} name="Accuracy (%)" />
          <Line type="monotone" dataKey="total_score" stroke="#10B981" strokeWidth={2} name="Total Score" />
          <Line type="monotone" dataKey="level4_score" stroke="#F59E0B" strokeWidth={2} name="Level 4 Score" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
