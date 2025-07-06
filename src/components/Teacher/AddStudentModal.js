// src/components/Teacher/AddStudentModal.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_BASE;

export default function AddStudentModal({ teacherId, onClose }) {
  const [formData, setFormData] = useState({
    recordId: '',
    userId: '',
    firstName: '',
    middleName: '',
    surname: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // General error message
  const [error, setError] = useState(null);

  // Helper to update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to safely parse JSON or throw
  const safeJsonParse = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Server did not return valid JSON');
    }
  };

  // Fetch next student ID on mount
  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const res = await fetch(`${API}/getNextUserId.php`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await safeJsonParse(res);

        if (res.ok && data.Student) {
          setFormData((prev) => ({
            ...prev,
            recordId: data.Student,
            userId: data.Student,
          }));
        } else {
          throw new Error(data.error || 'Failed to fetch next student ID');
        }
      } catch (err) {
        console.error('Fetch error:', err.message);
        toast.error(`Error fetching next student ID: ${err.message}`);
      }
    };

    fetchNextId();
  }, []);

  // Check if User ID already exists
  const isDuplicateUserId = async (idToCheck) => {
    try {
      const res = await fetch(
        `${API}/getUsers.php?role=Student&q=${encodeURIComponent(idToCheck)}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      const data = await safeJsonParse(res);

      return data.active.some((user) => user.user_id === idToCheck);
    } catch (err) {
      console.error('Duplicate check error:', err.message);
      return false;
    }
  };

  // Handle form submission
  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedUserId = formData.userId.trim();
    if (await isDuplicateUserId(trimmedUserId)) {
      toast.error('User ID already exists.');
      return;
    }

    const toastId = toast.loading('Adding student...');

    try {
      const res = await fetch(`${API}/signup.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: trimmedUserId,
          first_name: formData.firstName.trim(),
          middle_name: formData.middleName.trim() || null,
          surname: formData.surname.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: 'Student',
          teacher_id: teacherId,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success('Student added successfully!', { id: toastId });
        onClose();
      } else {
        throw new Error(result.error || 'Failed to add student.');
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 overflow-auto">
      <form
        onSubmit={handleAdd}
        className="relative bg-white rounded shadow-lg w-full max-w-full sm:max-w-lg max-h-full overflow-y-auto"
        autoComplete="off"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl leading-none"
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Add New Student</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="recordId">
                Record ID
              </label>
              <input
                id="recordId"
                name="recordId"
                type="text"
                value={formData.recordId}
                disabled
                className="w-full p-2 border bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="userId">
                User ID
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                placeholder="Format: STD-1"
                value={formData.userId}
                onChange={handleChange}
                className="w-full p-2 border"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                The Record ID is the Default User ID, but this is editable as it is used for logging
                in.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="p-2 border"
                required
              />
              <input
                id="middleName"
                name="middleName"
                type="text"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={handleChange}
                className="p-2 border"
              />
              <input
                id="surname"
                name="surname"
                type="text"
                placeholder="Surname"
                value={formData.surname}
                onChange={handleChange}
                className="p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                If no personal email is available, enter the teacher's email here.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-blue-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password will be securely hashed before storage.
              </p>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
