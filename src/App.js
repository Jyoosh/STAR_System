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
import StudentResults from './pages/StudentResults';
import StudentHistory from './pages/StudentHistory';
import MiniGamesModal from './components/MiniGames/MiniGamesModal';


import TrialReadingTest from './components/Assessment/TrialReadingTest';
import { ReactComponent as StarLogo } from './assets/STAR_Logo.svg';

export default function App() {
  const { user, logout } = useContext(AuthContext);
  const [showTrial, setShowTrial] = useState(false);
  const [showMiniGamesModal, setShowMiniGamesModal] = useState(false);


  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-stargreen-medium text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:text-stargreen-neon transition">
              <StarLogo className="w-8 h-8" />
              <span className="text-xl sm:text-2xl font-bold tracking-widest">STAR</span>
            </Link>

            <nav className="space-x-4 text-sm sm:text-base" aria-label="Main Navigation">
              {!user && (
                <>
                  <Link to="/" className="hover:text-stargreen-neon transition">Home</Link>
                  <Link to="/signin" className="hover:text-stargreen-neon transition">Sign In</Link>
                </>
              )}
              {user?.role === 'Admin' && (
                <>
                  <Link to="/admin" className="hover:text-stargreen-neon transition">Admin</Link>
                  <button onClick={logout} className="hover:text-red-300 transition">Logout</button>
                </>
              )}
              {user?.role === 'Teacher' && (
                <>
                  <Link to="/teacher" className="hover:text-stargreen-neon transition">Teacher</Link>
                  <button onClick={logout} className="hover:text-red-300 transition">Logout</button>
                </>
              )}
              {user?.role === 'Student' && (
                <>
                  <Link to="/student" className="hover:text-stargreen-neon transition">Student</Link>
                  <button onClick={logout} className="hover:text-red-300 transition">Logout</button>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content Routing */}
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route
            path="/signin"
            element={
              <main className="flex-grow p-6 bg-gradient-to-br from-green-50 to-green-100">
                {!user
                  ? <SignIn />
                  : <Navigate to={`/${user?.role?.toLowerCase() || ''}`} replace />}
              </main>
            }
          />

          <Route
            path="/admin"
            element={
              <main className="flex-grow p-6 bg-gradient-to-br from-green-50 to-green-100">
                <PrivateRoute>
                  <RoleRoute role="Admin">
                    <AdminPanel />
                  </RoleRoute>
                </PrivateRoute>
              </main>
            }
          />

          <Route
            path="/teacher"
            element={
              <main className="flex-grow p-6 bg-gradient-to-br from-green-50 to-green-100">
                <PrivateRoute>
                  <RoleRoute role="Teacher">
                    <TeacherPanel />
                  </RoleRoute>
                </PrivateRoute>
              </main>
            }
          />

          <Route
            path="/teacher/students/:userId/results"
            element={
              <main className="flex-grow p-6 bg-gradient-to-br from-green-50 to-green-100">
                <PrivateRoute>
                  <RoleRoute role="Teacher">
                    <StudentResults />
                  </RoleRoute>
                </PrivateRoute>
              </main>
            }
          />

          <Route
            path="/teacher/students/:userId/history"
            element={
              <main className="flex-grow p-6 bg-gradient-to-br from-green-50 to-green-100">
                <PrivateRoute>
                  <RoleRoute role="Teacher">
                    <StudentHistory />
                  </RoleRoute>
                </PrivateRoute>
              </main>
            }
          />

          <Route
            path="/student"
            element={
              <main className="flex-grow p-6 bg-gradient-to-br from-green-50 to-green-100">
                <PrivateRoute>
                  <RoleRoute role="Student">
                    <StudentDashboard
                      onLaunchTrial={() => setShowTrial(true)}
                      onLaunchMiniGames={() => setShowMiniGamesModal(true)}
                    />
                  </RoleRoute>
                </PrivateRoute>
              </main>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* ✅ Here is the modal usage */}
        {showMiniGamesModal && (
          <MiniGamesModal onClose={() => setShowMiniGamesModal(false)} />
        )}

        {/* Footer */}
        <footer className="bg-stargreen-medium text-white text-center p-2">
          <small>&copy; {new Date().getFullYear()} Tropical Village National High School</small>
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
