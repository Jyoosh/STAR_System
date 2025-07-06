import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Lottie from 'lottie-react';
import starsAnimation from '../animations/stars.json';

export default function SignIn() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ user_id: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (user?.role) navigate(`/${user.role.toLowerCase()}`, { replace: true });
  }, [user, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setCredentials(c => ({ ...c, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const ok = await login(credentials.user_id, credentials.password);
    if (!ok) {
      setError('Invalid credentials');
      setShake(true);
      setFadeIn(false);
      setTimeout(() => {
        setShake(false);
        setFadeIn(true);
      }, 400);
      setTimeout(() => setFadeIn(false), 1000);
    }
  };

  return (
    <div className="flex justify-center px-4 py-4 sm:py-8 bg-gradient-to-br from-green-50 to-green-100 min-h-[80vh]">

      <div
        className={`w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-xl text-center transition-all duration-300
          ${shake ? 'animate-shake' : ''}
          ${fadeIn ? 'animate-fadeIn' : ''}
        `}
      >
        <Lottie animationData={starsAnimation} className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3" />
        <p className="text-gray-500 italic text-sm mb-4">
          🌱 "Grow your reading skills every login!"
        </p>

        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-stargreen-medium">Sign In</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="user_id"
            placeholder="User ID"
            value={credentials.user_id}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-stargreen-light"
            required
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-stargreen-light"
              required
            />
            <div
              onClick={() => setShowPassword(v => !v)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-stargreen-medium hover:bg-stargreen-dark text-white font-semibold py-2 rounded-xl transition duration-200 disabled:opacity-50"
            disabled={!credentials.user_id || !credentials.password}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
