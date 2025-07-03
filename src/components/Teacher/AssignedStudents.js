// src/components/Teacher/AssignedStudents.js
import React from 'react';

export default function AssignedStudents({ students, onDelete }) {
  return (
    <table className="w-full table-auto border">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">ID</th>
          <th className="border p-2">Name</th>
          <th className="border p-2">Email</th>
          <th className="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.map(s => (
          <tr key={s.id}>
            <td className="border p-2">{s.id}</td>
            <td className="border p-2">{s.name}</td>
            <td className="border p-2">{s.email}</td>
            <td className="border p-2">
              <button
                onClick={() => onDelete(s.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
