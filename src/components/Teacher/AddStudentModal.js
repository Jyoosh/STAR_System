// src/components/Teacher/AddStudentModal.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function AddStudentModal({ teacherId, onClose }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

const handleAdd = async (e) => {
  e.preventDefault();

  const toastId = toast.loading('Adding student...'); // show loading

  try {
    const res = await fetch('/api/signup.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        username,
        password,
        role: 'Student',
        teacher_id: teacherId
      })
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
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <form onSubmit={handleAdd} className="bg-white p-6 rounded shadow space-y-4 w-full max-w-md">
        <h3 className="text-xl font-semibold">Add Student</h3>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2">Cancel</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
        </div>
      </form>
    </div>
  );
}
