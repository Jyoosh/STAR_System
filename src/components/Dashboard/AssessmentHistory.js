import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Determine badge color and label based on accuracy
const getReadingLevelBadge = (accuracy) => {
  if (accuracy >= 90) return { label: 'Fluent Reader', color: 'bg-green-500' };
  if (accuracy >= 75) return { label: 'Transitional Reader', color: 'bg-yellow-400' };
  if (accuracy >= 50) return { label: 'Developing Reader', color: 'bg-orange-400' };
  return { label: 'Emerging Reader', color: 'bg-red-500' };
};

const downloadCSV = (history) => {
  const headers = [
    'Date',
    'Total Score',
    'Max Score',
    'Accuracy',
    'Reading Level',
    'Level Label',
    'Level 1 Score',
    'Level 2 Score',
    'Level 3 Score',
    'Level 4 Score'
  ];

  const rows = history.map((r) => [
    new Date(r.assessed_at).toLocaleString(),
    r.total_score,
    r.max_score,
    `${r.accuracy}%`,
    r.reading_level,
    r.level,
    r.level1_score,
    r.level2_score,
    r.level3_score,
    r.level4_score
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) => row.map(String).map(value => `"${value.replace(/"/g, '""')}"`).join(','))
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'assessment_history.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function AssessmentHistory({
  history,
  expandedLogId,
  toggleLog,
  currentPage,
  setCurrentPage,
  itemsPerPage = 5,
}) {
  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!history.length) {
    return (
      <p className="mt-2 text-gray-600">
        {/* You haven’t started any assessments yet. */}
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
  <div>
    <h3 className="text-lg font-semibold text-indigo-700">Assessment History</h3>
    <p className="text-gray-600 text-sm">Here’s a summary of your past assessments.</p>
  </div>
  <button
    onClick={() => downloadCSV(history)}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm w-max"
  >
    Download CSV
  </button>
</div>


      {paginatedHistory.map((r, index) => {
        const date = new Date(r.assessed_at);
        const formatted = date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        const isExpanded = expandedLogId === r.id;
        const { label, color } = getReadingLevelBadge(r.accuracy);
        const isLatest = currentPage === 1 && index === 0;

        return (
          <div key={r.id} className="bg-white rounded-lg shadow border border-gray-200">
            <button
              className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition"
              onClick={() => toggleLog(r.id)}
            >
              <span className="text-sm font-medium text-indigo-700">
                {formatted} – Score: {r.total_score}/{r.max_score} ({r.accuracy}%)
                {isLatest && (
                  <span className="ml-2 inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Latest
                  </span>
                )}
              </span>
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 text-sm text-gray-700 space-y-2">
                <span className={`inline-block text-white text-xs font-semibold px-2 py-1 rounded ${color}`}>
                  {label}
                </span>

                <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                  <div className="flex justify-between">
                    <span>Level 1:</span>
                    <span className="font-medium">{r.level1_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 2:</span>
                    <span className="font-medium">{r.level2_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 3:</span>
                    <span className="font-medium">{r.level3_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 4 <span className="text-xs text-gray-500">(×2 pts)</span>:</span>
                    <span className="font-medium">{r.level4_score}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-center items-center gap-4 pt-4">
        <button
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-indigo-200 hover:bg-indigo-300 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>
        <span className="text-sm">Page {currentPage}</span>
        <button
          disabled={currentPage * itemsPerPage >= history.length}
          className="px-3 py-1 rounded bg-indigo-200 hover:bg-indigo-300 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
