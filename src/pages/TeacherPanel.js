// src/pages/TeacherPanel.js
import toast from 'react-hot-toast';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../auth/AuthContext';
import AssignedStudents from '../components/Teacher/AssignedStudents';
import AddStudentModal from '../components/Teacher/AddStudentModal';


export default function TeacherPanel() {
  const { user, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Optional: Debug or future admin logging
  // console.log("Logged in teacher:", user);

  const loadStudents = useCallback(async () => {
    try {
      const res = await fetch(`/api/getStudents.php?teacher_id=${user.id}`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  }, [user.id]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

const handleDelete = async (id) => {
  if (!window.confirm('Delete this student?')) return;

  try {
    const res = await fetch('/api/deleteUser.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: id })
    });

    if (res.ok) {
      toast.success('Student deleted successfully!');
      loadStudents();
    } else {
      toast.error('Failed to delete student. Please try again.');
    }
  } catch (err) {
    toast.error('An error occurred while deleting the student.');
    console.error('Failed to delete student:', err);
  }
};


  return (
    <div className="p-6 container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Student
      </button>

      <AssignedStudents students={students} onDelete={handleDelete} />

      {showModal && (
        <AddStudentModal
          teacherId={user.id}
          onClose={() => {
            setShowModal(false);
            loadStudents();
          }}
        />
      )}
    </div>
  );
}
