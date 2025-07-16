import React from 'react';

export default function ChooseAssessmentTypeModal({ onSelectType, onCancel }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 sm:px-6">
      {/* === BACKDROP === */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-indigo-200 bg-opacity-70 backdrop-blur-md transition-opacity duration-300"></div>

      {/* === MODAL PANEL === */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-indigo-100 transition-all duration-300 ease-out">
        <h2 className="text-xl font-bold text-center text-indigo-700 mb-4">
          Choose Assessment Type
        </h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelectType('standard')}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Without Speech Defect
          </button>
          <button
            onClick={() => onSelectType('speech_defect')}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            With Speech Defect
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
