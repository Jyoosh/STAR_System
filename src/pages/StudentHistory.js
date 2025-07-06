import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

export default function StudentHistory() {
  const { userId: studentId } = useParams();
  const API = process.env.REACT_APP_API_BASE || '';
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API}/getStudentHistory.php?student_id=${encodeURIComponent(studentId)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.history)) {
          setHistory(data.history);
        } else {
          throw new Error(data.error || 'Invalid response');
        }
      } catch (err) {
        console.error('Error loading student history:', err);
        toast.error('Failed to load student history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [API, studentId]);

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const currentItems = history.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 text-sm mb-4 hover:underline"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Assessment History for <span className="text-blue-700">{studentId}</span>
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-gray-600 italic">No history found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded text-sm sm:text-base">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Score</th>
                  <th className="text-left px-4 py-2">Accuracy</th>
                  <th className="text-left px-4 py-2">Reading Level</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((entry, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{entry.assessed_at}</td>
                    <td className="px-4 py-2">{entry.total_score}</td>
                    <td className="px-4 py-2">{entry.accuracy}%</td>
                    <td className="px-4 py-2 font-semibold">{entry.reading_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-white hover:bg-blue-100'}`}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-white hover:bg-blue-100'}`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
