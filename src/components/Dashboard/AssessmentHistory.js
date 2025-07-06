import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const getReadingLevelBadge = (accuracy) => {
  if (accuracy >= 90) return { label: 'Level 4', color: 'bg-green-500' };
  if (accuracy >= 75) return { label: 'Level 3', color: 'bg-yellow-400' };
  if (accuracy >= 50) return { label: 'Level 2', color: 'bg-orange-400' };
  return { label: 'Level 1', color: 'bg-red-500' };
};

const downloadCSV = (history) => {
  const headers = [
    'Date', 'Total Score', 'Max Score', 'Accuracy',
    'Reading Level', 'Level Label',
    'Level 1 Score', 'Level 2 Score', 'Level 3 Score', 'Level 4 Score',
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
    r.level4_score,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map(String).map((value) => `"${value.replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
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
      <p className="mt-4 text-center text-gray-500 italic">
        You haven’t started any assessments yet.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-stargreen-dark">
            Assessment History
          </h3>
          <p className="text-gray-600 text-sm">
            Here’s a summary of your past assessments.
          </p>
        </div>
        <button
          onClick={() => downloadCSV(history)}
          className="px-4 py-2 bg-[#398908] text-white text-sm rounded-md hover:bg-[#295A12] transition w-full sm:w-auto"
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
          <div key={r.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition text-left"
              onClick={() => toggleLog(r.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-sm font-medium text-[#295A12]">
                <span>{formatted}</span>
                <span className="text-gray-500 hidden sm:inline">–</span>
                <span>
                  Score: {r.total_score}/{r.max_score} ({r.accuracy}%)
                </span>
                {isLatest && (
                  <span className="ml-2 mt-1 sm:mt-0 inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Latest
                  </span>
                )}
              </div>
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 text-sm text-gray-700 space-y-3">
                <span
                  className={`inline-block text-white text-xs font-semibold px-2 py-1 rounded ${color}`}
                >
                  {label}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-sm">
                  <div className="flex justify-between">
                    <span>Level 1:</span>
                    <span className="font-medium">{r.level1_score ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 2:</span>
                    <span className="font-medium">{r.level2_score ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 3:</span>
                    <span className="font-medium">{r.level3_score ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Level 4 <span className="text-xs text-gray-500">(×2 pts)</span>:
                    </span>
                    <span className="font-medium">{r.level4_score ?? '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-center items-center gap-4 pt-6">
        <button
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-[#C6E90E] hover:bg-[#87DC3F] text-[#295A12] disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-700">Page {currentPage}</span>
        <button
          disabled={currentPage * itemsPerPage >= history.length}
          className="px-3 py-1 rounded bg-[#C6E90E] hover:bg-[#87DC3F] text-[#295A12] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
