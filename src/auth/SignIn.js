import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // 👁️ icons from react-icons

export default function SignIn() {
  const { login } = useContext(AuthContext);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 🔒 visibility toggle
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(userId, password);
    if (success) {
      switch (success.role) {
        case 'Admin': navigate('/admin'); break;
        case 'Teacher': navigate('/teacher'); break;
        case 'Student': navigate('/student'); break;
        default: navigate('/');
      }
    } else {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          className="w-full p-2 border"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border pr-10"
            required
          />
          <div
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </div>
        </div>

        <button className="w-full bg-green-600 text-white py-2 rounded">Login</button>
      </form>
    </div>
  );
}
