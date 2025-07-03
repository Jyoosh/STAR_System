import React, { useEffect, useState } from 'react';

const mockResults = [
  { date: '2025-06-10', level: 'Non-Reader' },
  { date: '2025-06-15', level: 'Pre-Reader' },
  { date: '2025-06-21', level: 'Emergent Reader' },
];

const StudentProgress = () => {
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    // 🔁 Replace this with real data from IndexedDB or backend later
    setProgress(mockResults);
  }, []);

  return (
    <div className="bg-white shadow p-4 rounded">
      <h3 className="text-lg font-semibold mb-2">Assessment History</h3>
      <table className="w-full text-sm text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Reading Level</th>
          </tr>
        </thead>
        <tbody>
          {progress.map((entry, index) => (
            <tr key={index}>
              <td className="p-2 border">{entry.date}</td>
              <td className="p-2 border">{entry.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentProgress;
