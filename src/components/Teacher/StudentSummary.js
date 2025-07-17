import React, { useState } from 'react';
import {
  GraduationCap,
  BarChart2,
  History,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';

export default function StudentSummary({
  student,
  onDelete,
  onViewResults,
  onViewHistory,
  onEdit
}) {
  const [expanded, setExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 for toggling password

  const {
    user_id,
    first_name,
    middle_name,
    surname,
    gender,
    birthday,
    age,
    grade_level,
    latest_score,
    latest_level,
    last_assessed_at,
    password // 👈 ensure this is passed from student object
  } = student;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date) ? '' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <GraduationCap className="text-green-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-lg font-semibold text-gray-800 leading-snug">
              {first_name} {middle_name} {surname}
            </h3>
            <p className="text-sm text-gray-600">User ID: {user_id}</p>
          </div>
          <div className="ml-2 text-green-700">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap sm:flex-nowrap sm:justify-end gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onViewResults(student); }}
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
          >
            <BarChart2 size={16} /> Results
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onViewHistory(student); }}
            className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm"
          >
            <History size={16} /> History
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(student); }}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(user_id); }}
            className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 text-sm text-gray-700 space-y-1 pl-1">
          <p><strong>Gender:</strong> {gender || 'N/A'}</p>
          <p><strong>Birthday:</strong> {birthday ? formatDate(birthday) : 'N/A'}</p>
          <p><strong>Age:</strong> {age !== undefined ? age : 'N/A'}</p>
          <p><strong>Grade Level:</strong> {grade_level || 'N/A'}</p>
          <p>
            <strong>Last Assessed:</strong>{' '}
            {last_assessed_at ? (
              <span className="text-gray-800 font-medium">{formatDate(last_assessed_at)}</span>
            ) : (
              <em className="text-gray-400">Never</em>
            )}
          </p>
          <p>
            <strong>Latest Score:</strong>{' '}
            {latest_score !== undefined ? (
              <>
                <span className="text-blue-700 font-semibold">{latest_score}/40</span>{' '}
                | Level: <span className="text-purple-700 font-semibold">{latest_level}</span>
              </>
            ) : (
              <em className="text-gray-400">No scores yet</em>
            )}
          </p>
          <p className="flex items-center gap-2">
            <strong>Password:</strong>{' '}
            <span className="font-mono">
              {showPassword ? password : '*'.repeat(password?.length || 8)}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-800 focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
