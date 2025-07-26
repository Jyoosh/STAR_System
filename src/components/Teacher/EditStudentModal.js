import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_BASE;

export default function EditStudentModal({ student, onClose, onSave }) {
  const [formData, setFormData] = useState({
    user_id: '',
    first_name: '',
    middle_name: '',
    surname: '',
    password: '',
    gender: '',
    birthday: '',
    grade_level: '',
    section: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (student) {
      setFormData({
        user_id: student.user_id || '',
        first_name: student.first_name || '',
        middle_name: student.middle_name || '',
        surname: student.surname || '',
        password: '',
        gender: student.gender || '',
        birthday: student.birthday || '',
        grade_level: student.grade_level || '',
        section: student.section || '',
      });
    }
  }, [student]);

  const computeAgeFromBirthday = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    const toastId = toast.loading('Updating student...');

    try {
      const age = computeAgeFromBirthday(formData.birthday);
      const res = await fetch(`${API}/editUser.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: formData.user_id,
          first_name: formData.first_name.trim(),
          middle_name: formData.middle_name?.trim() || null,
          surname: formData.surname.trim(),
          password: formData.password || null,
          gender: formData.gender,
          birthday: formData.birthday,
          age,
          grade_level: formData.grade_level,
          section: formData.section?.trim() || null,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success('Student updated successfully!', { id: toastId });
        onSave();
      } else {
        throw new Error(result.error || 'Failed to update student.');
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

return (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 overflow-auto z-50">
    <form
      onSubmit={handleUpdate}
      className="relative bg-white rounded-xl shadow-lg w-full max-w-full sm:max-w-lg max-h-full overflow-y-auto"
      autoComplete="off"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-3 text-gray-500 hover:text-black text-2xl"
        aria-label="Close modal"
      >
        &times;
      </button>

      <div className="p-6">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Edit Student</h3>

        <div className="space-y-5">
          {/* User ID (disabled) */}
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="userId">User ID</label>
            <input
              id="userId"
              name="user_id"
              type="text"
              value={formData.user_id}
              disabled
              className="w-full p-2 border rounded bg-gray-100 text-gray-700"
            />
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-700">First Name</label>
              <input
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Middle Name</label>
              <input
                name="middle_name"
                type="text"
                value={formData.middle_name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Surname</label>
              <input
                name="surname"
                type="text"
                value={formData.surname}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          {/* Gender & Birthday */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Birthday</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Grade Level & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Grade Level</label>
              <select
                name="grade_level"
                value={formData.grade_level}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Grade Level</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Section</label>
              <input
                name="section"
                type="text"
                placeholder="New Section"
                value={formData.section}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              New Password (leave blank to keep current)
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                autoComplete="new-password"
                value={formData.password || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-blue-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password will be hashed for login but also stored in plain text for admin/teacher access.
            </p>
          </div>

          {/* Error */}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
);

}
