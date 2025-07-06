import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentList from '../components/Dashboard/StudentList';
import StudentProgress from '../components/Dashboard/StudentProgress';

export default function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C6E90E] via-[#87DC3F] to-[#398908] px-4 py-6">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#295A12]">📊 Dashboard</h2>
            {user && (
              <p className="text-sm text-gray-700">
                Welcome, <span className="font-semibold text-[#398908]">{user.name}</span> — <span className="italic text-gray-600">{user.role}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded shadow"
          >
            Logout
          </button>
        </div>

        {/* 🔁 Conditional Rendering by Role */}
        {user?.role === 'Admin' || user?.role === 'Client' ? (
          <div>
            <h3 className="text-lg font-semibold text-[#295A12] mb-3">📚 Student Overview</h3>
            <StudentList />
            {/* Optionally add charts/analytics here */}
          </div>
        ) : user?.role === 'Student' ? (
          <div>
            <h3 className="text-lg font-semibold text-[#295A12] mb-3">📈 Your Reading Progress</h3>
            <StudentProgress />
          </div>
        ) : (
          <p className="text-red-600 font-medium">Unknown role or not authorized</p>
        )}
      </div>
    </div>
  );
}
