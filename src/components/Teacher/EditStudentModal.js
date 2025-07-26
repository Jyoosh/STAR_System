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
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success('Student updated successfully!', { id: toastId });
        onSave();
        onClose();
      } else {
        throw new Error(result.error || 'Failed to update student.');
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 overflow-auto">
      <form
        onSubmit={handleUpdate}
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
          <h3 className="text-xl font-semibold mb-4 text-center">Edit Student</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="userId">
                User ID
              </label>
              <input
                id="userId"
                name="user_id"
                type="text"
                value={formData.user_id}
                disabled
                className="w-full p-2 border bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                name="first_name"
                type="text"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                className="p-2 border"
                required
              />
              <input
                name="middle_name"
                type="text"
                placeholder="Middle Name"
                value={formData.middle_name || ''}
                onChange={handleChange}
                className="p-2 border"
              />
              <input
                name="surname"
                type="text"
                placeholder="Surname"
                value={formData.surname}
                onChange={handleChange}
                className="p-2 border"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2 border"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Birthday</label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full p-2 border"
                />
              </div>
            </div>

            <div>
<select
  name="grade_level"
  value={formData.grade_level}
  onChange={handleChange}
  className="p-2 border"
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
                  className="w-full p-2 border pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-blue-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password will be hashed for login but also stored in plain text for admin/teacher access.
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
                className="px-4 py-2 bg-green-600 text-white rounded w-full sm:w-auto"
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
