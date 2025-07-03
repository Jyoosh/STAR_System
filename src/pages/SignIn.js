// File: src/pages/SignIn.js
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function SignIn() {
  const { user, login } = useContext(AuthContext);
  const navigate        = useNavigate();
  const [credentials, setCredentials] = useState({ user_id: '', password: '' });
  const [error, setError]             = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    if (!ok) setError('Invalid credentials');
  };

  return (
    <div className="max-w-sm mx-auto mt-12 bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Sign In</h2>
      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="user_id"
          placeholder="User ID"
          value={credentials.user_id}
          onChange={handleChange}
          className="w-full p-2 border mb-4"
          required
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            className="w-full p-2 border pr-10"
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
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={!credentials.user_id || !credentials.password}
        >
          Login
        </button>
      </form>
    </div>
  );
}
