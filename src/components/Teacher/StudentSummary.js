import React from 'react';
import { GraduationCap, BarChart2, History, Trash2 } from 'lucide-react';

export default function StudentSummary({
  student,
  onDelete,
  onViewResults,
  onViewHistory
}) {
  const {
    user_id,
    first_name,
    surname,
    email,
    latest_score,
    latest_level,
    last_assessed_at,
  } = student;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      {/* Student Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
          <GraduationCap className="text-green-600" size={20} />
          <span className="truncate">{first_name} {surname}</span>
        </h3>
        <p className="text-sm text-gray-600 truncate">User ID: {user_id}</p>
        <p className="text-sm text-gray-600 truncate">Email: {email}</p>
        <p className="text-sm text-gray-600">
          Last Assessed:{' '}
          {last_assessed_at ? (
            <span className="text-gray-800 font-medium">{last_assessed_at}</span>
          ) : (
            <em className="text-gray-400">Never</em>
          )}
        </p>
        {latest_score !== undefined && latest_level && (
          <p className="text-sm text-gray-600">
            Latest Score: <span className="text-blue-700 font-semibold">{latest_score}/40</span>{' '}
            | Level: <span className="text-purple-700 font-semibold">{latest_level}</span>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <button
          onClick={() => onViewResults(student)}
          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm w-full sm:w-auto"
        >
          <BarChart2 size={16} /> Results
        </button>
        <button
          onClick={() => onViewHistory(student)}
          className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm w-full sm:w-auto"
        >
          <History size={16} /> History
        </button>
        <button
          onClick={() => onDelete(student.user_id)}
          className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm w-full sm:w-auto"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}
