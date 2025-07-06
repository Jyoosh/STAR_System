import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHistory from '../components/Dashboard/AssessmentHistory';

export default function StudentResults() {
  const { userId: studentId } = useParams();
  const API = process.env.REACT_APP_API_BASE || '';
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const toggleLog = (id) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${API}/getStudentResults.php?student_id=${encodeURIComponent(studentId)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.results)) {
          setHistory(data.results);
        } else {
          throw new Error(data.error || 'Invalid response');
        }
      } catch (err) {
        console.error('Error loading results:', err);
        toast.error('Failed to load student results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [API, studentId]);

  return (
    <div className="container mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 text-sm mb-4 hover:underline"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-4">
        Assessment Results for <span className="text-blue-700">{studentId}</span>
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <AssessmentHistory
          history={history}
          expandedLogId={expandedLogId}
          toggleLog={toggleLog}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}
