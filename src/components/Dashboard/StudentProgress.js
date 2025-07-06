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
    <div className="bg-white shadow p-4 sm:p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-[#295A12] mb-3">Assessment History</h3>
      <table className="w-full text-sm sm:text-base text-left border border-gray-300 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-[#87DC3F] text-white">
            <th className="p-2 border border-gray-200">Date</th>
            <th className="p-2 border border-gray-200">Reading Level</th>
          </tr>
        </thead>
        <tbody>
          {progress.map((entry, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? 'bg-green-50' : 'bg-white'}
            >
              <td className="p-2 border border-gray-200">{entry.date}</td>
              <td className="p-2 border border-gray-200 text-[#295A12] font-medium">
                {entry.level}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentProgress;
