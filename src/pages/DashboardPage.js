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
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Dashboard</h2>
          {user && (
            <p className="text-sm text-gray-700">
              Welcome, <span className="font-bold">{user.name}</span> — <span className="italic">{user.role}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* 🔁 Conditional Rendering by Role */}
      {user?.role === 'Admin' || user?.role === 'Client' ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">Student Overview</h3>
          <StudentList />
          {/* You can add more analytics, charts, etc. here */}
        </div>
      ) : user?.role === 'Student' ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Reading Progress</h3>
          <StudentProgress />
        </div>
      ) : (
        <p>Unknown role or not authorized</p>
      )}
    </div>
  );
}
