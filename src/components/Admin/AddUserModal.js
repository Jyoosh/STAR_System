// src/components/Admin/AddUserModal.js
import React, { useState, useEffect } from 'react';

export default function AddUserModal({
  onClose,
  teacherNextId = '',
  studentNextId = ''
}) {
  const roles = ['Teacher', 'Student'];
  const [selectedRole, setSelectedRole] = useState('Teacher');

  // Form fields
  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [surname, setSurname] = useState('');
  // const [email,] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    gender: '',
    birthday: '',
    age: '',
    grade_level: '',
    section: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'birthday') {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setFormData((prev) => ({
        ...prev,
        birthday: value,
        age: isNaN(age) ? '' : age.toString(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };



  // Reset userId when role or next IDs change
  useEffect(() => {
    const next = selectedRole === 'Teacher' ? teacherNextId : studentNextId;
    setUserId(next);
  }, [selectedRole, teacherNextId, studentNextId]);

  const userIdPlaceholder =
    selectedRole === 'Teacher' ? 'Format: TCR-1' : 'Format: STD-1';

  const SIGNUP_ENDPOINT = `${process.env.REACT_APP_API_BASE}/addStudent.php`;

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);

    const payload =
      selectedRole === 'Student'
        ? {
          user_id: userId.trim(),
          first_name: firstName.trim(),
          middle_name: middleName.trim() || null,
          surname: surname.trim(),
          email: `${userId.trim()}@placeholder.com`,
          password,
          role: selectedRole,
          teacher_id: teacherId.trim(),
          gender: formData.gender,
          birthday: formData.birthday,
          age: formData.age,
          grade_level: formData.grade_level,
          section: formData.section.trim(),
        }
        : {
          user_id: userId.trim(),
          first_name: firstName.trim(),
          middle_name: middleName.trim() || null,
          surname: surname.trim(),
          email: `${userId.trim()}@placeholder.com`,
          password,
          role: selectedRole,
          gender: formData.gender,
          birthday: formData.birthday,
          age: formData.age,
        };



    try {
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      let json = null;
      try { json = JSON.parse(responseText); } catch { }

      if (!res.ok) {
        throw new Error(json?.error || `Server returned ${res.status}`);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 overflow-auto">
      <form
        onSubmit={handleAdd}
        className="relative bg-white rounded shadow-lg w-full max-w-full sm:max-w-lg max-h-full overflow-y-auto"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl leading-none"
        >
          &times;
        </button>

        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Add New {selectedRole}
          </h3>

          {/* Role tabs */}
          <div className="flex mb-6 border-b">
            {roles.map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex-1 py-2 text-center ${selectedRole === role
                  ? 'border-b-2 border-blue-600 font-semibold'
                  : 'text-gray-600'
                  }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {/* ID fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Record ID
              </label>
              <input
                type="text"
                value={selectedRole === 'Teacher' ? teacherNextId : studentNextId}
                disabled
                className="w-full p-2 border bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <input
                type="text"
                placeholder={userIdPlaceholder}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The Record ID is the Default User ID, but this is editable as it is used for logging in.
              </p>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="p-2 border"
                required
              />
              <input
                type="text"
                placeholder="Middle Name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="p-2 border"
              />
              <input
                type="text"
                placeholder="Surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="p-2 border"
                required
              />
            </div>

            {/* Email */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                If no personal email is available, enter the teacher's email here.
              </p>
            </div> */}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-blue-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {/* <p className="text-xs text-gray-500 mt-1">
                Password will be securely hashed before storage.
              </p> */}
            </div>

            {selectedRole === 'Teacher' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2 border"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full p-2 border"
                    required
                  />
                </div>
              </div>
            )}


            {/* Student-specific fields */}
            {selectedRole === 'Student' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-2 border"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      className="w-full p-2 border"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <input
                    name="section"
                    type="text"
                    placeholder="Section"
                    value={formData.section}
                    onChange={handleChange}
                    className="p-2 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teacher ID
                  </label>
                  <input
                    type="text"
                    placeholder="Assign supervising Teacher ID"
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full p-2 border"
                    required
                  />
                </div>
              </>
            )}


            {/* Error message */}
            {error && <p className="text-red-600">{error}</p>}

            {/* Form actions */}
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
                Add {selectedRole}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
