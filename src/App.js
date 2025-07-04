// src/App.js
import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';
import RoleRoute from './auth/RoleRoute';

import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import AdminPanel from './pages/AdminPanel';
import TeacherPanel from './pages/TeacherPanel';
import StudentDashboard from './pages/StudentDashboard';

import TrialReadingTest from './components/Assessment/TrialReadingTest';
import { ReactComponent as StarLogo } from './assets/STAR_Logo.svg';

export default function App() {
  const { user, logout } = useContext(AuthContext);
  const [showTrial, setShowTrial] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-blue-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:text-yellow-300 transition">
              <StarLogo className="w-8 h-8" />
              <span className="text-xl sm:text-2xl font-bold tracking-widest">STAR</span>
            </Link>

            <nav className="space-x-4 text-sm sm:text-base" aria-label="Main Navigation">
              {!user && (
                <>
                  <Link to="/" className="hover:text-yellow-300 transition">Home</Link>
                  <Link to="/signin" className="hover:text-yellow-300 transition">Sign In</Link>
                </>
              )}
              {user?.role === 'Admin' && (
                <>
                  <Link to="/admin" className="hover:text-yellow-300 transition">Admin</Link>
                  <button onClick={logout} className="hover:text-red-300 transition">Logout</button>
                </>
              )}
              {user?.role === 'Teacher' && (
                <>
                  <Link to="/teacher" className="hover:text-yellow-300 transition">Teacher</Link>
                  <button onClick={logout} className="hover:text-red-300 transition">Logout</button>
                </>
              )}
              {user?.role === 'Student' && (
                <>
                  <Link to="/student" className="hover:text-yellow-300 transition">Student</Link>
                  <button onClick={logout} className="hover:text-red-300 transition">Logout</button>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow p-6 bg-gray-100">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/signin"
              element={
                !user
                  ? <SignIn />
                  : <Navigate to={`/${user?.role?.toLowerCase() || ''}`} replace />
              }
            />

            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <RoleRoute role="Admin">
                    <AdminPanel />
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/teacher"
              element={
                <PrivateRoute>
                  <RoleRoute role="Teacher">
                    <TeacherPanel />
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/student"
              element={
                <PrivateRoute>
                  <RoleRoute role="Student">
                    <StudentDashboard onLaunchTrial={() => setShowTrial(true)} />
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-blue-600 text-white text-center p-2">
          <small>&copy; {new Date().getFullYear()} Tropical Village NHS</small>
        </footer>
      </div>

      {/* Global Toasts */}
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Trial Modal */}
      {showTrial && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center">
          <TrialReadingTest onClose={() => setShowTrial(false)} />
        </div>
      )}
    </Router>
  );
}
