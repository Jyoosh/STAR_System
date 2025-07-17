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
  const [sortBy,] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');



  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleEditStudent = (student) => {
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
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        const uniqueStudents = Array.from(
          new Map(data.map((s) => [s.record_id, s])).values()
        );
        setStudents(uniqueStudents);
      } else {
        setStudents([]);
        console.error('Invalid data format from getStudents.php', data);
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

  const uniqueGrades = Array.from(new Set(students.map((s) => s.grade_level).filter(Boolean))).sort();

  const gradeCounts = uniqueGrades.map((grade) => {
    const count = students.filter((s) => s.grade_level === grade).length;
    return { grade, count };
  });

  // Filter and sort students
  const filteredStudents = students
    .filter((s) =>
      [s.first_name, s.surname, s.user_id]
        .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter((s) => (gradeFilter ? s.grade_level === gradeFilter : true))
    .filter((s) => (genderFilter ? s.gender === genderFilter : true))
    .sort((a, b) => {
      if (sortBy === 'age') return (a.age ?? 0) - (b.age ?? 0);
      if (sortBy === 'grade') return (a.grade_level || '').localeCompare(b.grade_level || '', undefined, { numeric: true });
      return 0;
    });



  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when search or sort changes
  }, [searchTerm, sortBy]);

  return (
    <div className="p-6 container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#295A12]">Teacher Dashboard</h2>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Filter by Gender:</label>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Filter by Grade:</label>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="">All Grades</option>
            {gradeCounts.map(({ grade, count }) => (
              <option key={grade} value={grade}>
                {grade} ({count})
              </option>
            ))}
          </select>
        </div>
      </div>


      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-2">
          📚 Summary
        </h2>
        <p className="text-sm text-gray-700 mb-3">
          Total Non-Readers: <span className="font-bold text-red-600">{students.length}</span>
        </p>
        <div className="space-y-1 max-h-[200px] overflow-y-auto sm:max-h-none text-sm">
          {gradeCounts.map(({ grade, count }) => (
            <div
              key={grade}
              className={`cursor-pointer px-2 py-1 rounded-md hover:bg-gray-100 transition-colors ${grade === gradeFilter ? 'text-green-800 font-semibold' : 'text-gray-700'}`}
              onClick={() => setGradeFilter(grade)}
            >
              Grade {grade}: <span className="font-medium text-red-500">{count}</span>
            </div>
          ))}
        </div>
      </div>




      <div className="space-y-4">
        {paginatedStudents.length > 0 ? (
          paginatedStudents.map((student) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6 text-sm">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-[#295A12] text-white rounded hover:bg-[#398908] disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm font-medium text-gray-800">
            Page <span className="text-green-700">{currentPage}</span> of <span className="text-green-700">{totalPages}</span>
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-[#295A12] text-white rounded hover:bg-[#398908] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

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
