import React, { useEffect, useState, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import AddStudentModal from '../components/Teacher/AddStudentModal';
import StudentSummary from '../components/Teacher/StudentSummary';
import { FaSearch } from 'react-icons/fa';
import EditStudentModal from '../components/Teacher/EditStudentModal';


export default function TeacherPanel() {
  const API = process.env.REACT_APP_API_BASE || '';
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [nextStudentId, setNextStudentId] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [sortBy, setSortBy] = useState('');

const handleEditStudent = (student) => {
  console.log('[DEBUG] Edit student:', student); // ← Add this
  setSelectedStudent(student);
  setShowEditModal(true);
};


  const loadStudents = useCallback(async () => {
    if (!user?.id) {
      setStudents([]);
      return;
    }

    try {
      const res = await fetch(
        `${API}/getStudents.php?teacher_id=${encodeURIComponent(user.id)}`,
        { credentials: 'include' }
      );
      const text = await res.text();
      console.log('Raw response from getStudents.php:', text);
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        const uniqueStudents = Array.from(
          new Map(data.map((s) => [s.record_id, s])).values()
        );
        setStudents(uniqueStudents);
      } else {
        console.error('Invalid data format from getStudents.php', data);
        setStudents([]);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudents([]);
      toast.error('Failed to load students.');
    }
  }, [API, user?.id]);

  useEffect(() => {
    loadStudents();
    const interval = setInterval(() => loadStudents(), 30000);
    return () => clearInterval(interval);
  }, [loadStudents]);

  const fetchNextStudentId = async () => {
    try {
      const res = await fetch(`${API}/getNextUserId.php`, {
        method: 'GET',
        credentials: 'include',
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (res.ok && data.Student) {
        setNextStudentId(data.Student);
        setShowModal(true);
      } else {
        throw new Error(data.error || 'Invalid student ID response');
      }
    } catch (err) {
      console.error('Failed to fetch next student ID:', err.message);
      toast.error('Error fetching next student ID.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      const res = await fetch(`${API}/deleteUser.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: id }),
      });
      if (res.ok) {
        toast.success('Student deleted successfully!');
        loadStudents();
      } else {
        toast.error('Failed to delete student. Please try again.');
      }
    } catch (err) {
      console.error('Failed to delete student:', err);
      toast.error('An error occurred while deleting the student.');
    }
  };

  const handleShowResults = (student) => {
    navigate(`/teacher/students/${student.user_id}/results`);
  };

  const handleShowHistory = (student) => {
    navigate(`/teacher/students/${student.user_id}/history`);
  };

  const filteredStudents = students
    .filter((s) =>
      [s.first_name, s.surname, s.user_id]
        .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'age') return (a.age ?? 0) - (b.age ?? 0);
      if (sortBy === 'grade') return (a.grade_level || '').localeCompare(b.grade_level || '', undefined, { numeric: true });
      return 0;
    });


  return (
    <div className="p-6 container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#295A12]">Teacher Dashboard</h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={fetchNextStudentId}
          className="bg-[#295A12] hover:bg-[#398908] text-white px-4 py-2 rounded w-full sm:w-auto transition"
        >
          Add Student
        </button>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-[#87DC3F] rounded pl-10 focus:outline-none focus:ring-2 focus:ring-[#C6E90E]"
          />
          <FaSearch className="absolute left-3 top-3 text-[#398908]" />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm font-medium text-gray-700">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">None</option>
          <option value="age">Age</option>
          <option value="grade">Grade Level</option>
        </select>
      </div>


      <div className="space-y-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <StudentSummary
              key={student.record_id}
              student={student}
              onDelete={handleDelete}
              onViewResults={handleShowResults}
              onViewHistory={handleShowHistory}
              onEdit={handleEditStudent}
            />
          ))
        ) : (
          <p className="text-gray-600 text-center mt-8">No students found.</p>
        )}
      </div>

      {showModal && (
        <AddStudentModal
          teacherId={user.id}
          nextStudentId={nextStudentId}
          onClose={() => {
            setShowModal(false);
            loadStudents();
          }}
        />
      )}

      {showEditModal && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          onClose={() => setShowEditModal(false)}
          onSave={loadStudents}
        />
      )}
    </div>
  );
}
