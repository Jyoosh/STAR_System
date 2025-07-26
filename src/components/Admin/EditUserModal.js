import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const API = process.env.REACT_APP_API_BASE;

export default function EditUserModal({ user, onClose, onUserUpdated }) {
    const [form, setForm] = useState({ ...user });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isCheckingId, setIsCheckingId] = useState(false);
    const [isIdTaken, setIsIdTaken] = useState(false);

    const gradeOptions = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

    // Check ID uniqueness when userId changes
    useEffect(() => {
        if (form.user_id && form.user_id !== user.user_id) {
            setIsCheckingId(true);
            axios.post(`${API}/checkUserId.php`, { user_id: form.user_id })
                .then(res => {
                    setIsIdTaken(res.data.exists);
                    setIsCheckingId(false);
                })
                .catch(() => setIsCheckingId(false));
        }
    }, [form.user_id, user.user_id]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

const handleSubmit = async e => {
    e.preventDefault();
    if (isIdTaken) {
        setError('User ID is already taken.');
        return;
    }

    try {
        await axios.post(`${API}/editUser.php`, form, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (typeof onUserUpdated === 'function') {
            onUserUpdated(form); // pass updated user data
        }

        onClose();
    } catch (error) {
        console.error('❌ Failed to save:', error);
        setError('Failed to save changes.');
    }
};



    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center overflow-y-auto px-4 py-6">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 mt-auto mb-auto">
                <h2 className="text-xl font-semibold mb-4">Edit {user.role}</h2>
                {error && <p className="text-red-600 mb-2">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role (locked) */}
                    <div>
                        <label className="font-semibold">Role</label>
                        <input
                            type="text"
                            value={form.role}
                            disabled
                            className="w-full border p-2 rounded bg-gray-100"
                        />
                    </div>

                    {/* User ID (editable + check availability) */}
                    <div>
                        <label className="font-semibold">User ID</label>
                        <input
                            type="text"
                            name="user_id"
                            value={form.user_id || ''}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />

                        {isCheckingId ? (
                            <p className="text-sm text-gray-500">Checking...</p>
                        ) : isIdTaken ? (
                            <p className="text-sm text-red-500">User ID already taken.</p>
                        ) : null}
                    </div>

                    {/* Name fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                            <label>First Name</label>
                            <input name="first_name" value={form.first_name || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
                        </div>
                        <div>
                            <label>Middle Name</label>
                            <input name="middle_name" value={form.middle_name || ''} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label>Surname</label>
                            <input name="surname" value={form.surname || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
                        </div>
                    </div>

                    {/* Gender + Birthday */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <label>Gender</label>
                            <select name="gender" value={form.gender || ''} onChange={handleChange} className="w-full border p-2 rounded" required>
                                <option value="">Select</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                        <div>
                            <label>Birthday</label>
                            <input type="date" name="birthday" value={form.birthday || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
                        </div>
                    </div>

                    {/* Grade & Section (only for Students) */}
                    {form.role === 'Student' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <label>Grade</label>
                                <select name="grade" value={form.grade || ''} onChange={handleChange} className="w-full border p-2 rounded" required>
                                    <option value="">Select Grade</option>
                                    {gradeOptions.map((grade) => (
                                        <option key={grade} value={grade}>
                                            {grade}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Section</label>
                                <input name="section" value={form.section || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
                            </div>
                        </div>
                    )}

                    {/* Password with toggle */}
                    <div>
                        <label>Password</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password || ''}
                                onChange={handleChange}
                                className="w-full border p-2 rounded pr-10"
                                required
                            />
                            <button
                                type="button"
                                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600"
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Assessment Info for Students */}
                    {form.role === 'Student' && (
                        <div className="text-sm text-gray-600">
                            <p>Last Assessed: {form.last_assessed || 'N/A'}</p>
                            <p>Score: {form.score || 'N/A'}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded w-full sm:w-auto">
                            Cancel
                        </button>
                        <button type="submit" disabled={isIdTaken} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full sm:w-auto">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}
