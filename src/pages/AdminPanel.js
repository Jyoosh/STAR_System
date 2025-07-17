import React, { useState, useEffect, useContext } from 'react';
import AddUserModal from '../components/Admin/AddUserModal';
import UserList from '../components/Admin/UserList';
import { AuthContext } from '../auth/AuthContext';

export default function AdminPanel() {
  const API = process.env.REACT_APP_API_BASE;
  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [counts, setCounts] = useState({ Teacher: 0, Student: 0 });
  const [nextIds, setNextIds] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const adminName = user ? `${user.first_name || ''} ${user.surname || ''}`.trim() || 'Admin' : 'Admin';

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, uRes] = await Promise.all([
          fetch(`${API}/getUserCounts.php`, { credentials: 'include' }).then(r => r.json()),
          fetch(`${API}/getUsers.php`, { credentials: 'include' }).then(r => r.json())
        ]);

        if (cRes.counts) setCounts(cRes.counts);
        setNextIds(cRes.nextIds || {});
        console.log('Fetched users:', uRes);
        setUsers(uRes.active || []);
        setDeletedUsers(uRes.deleted || []);
      } catch (e) {
        console.error('Error loading users/counts:', e);
      }
    };

    load();
  }, [API]);

  const handleDelete = async id => {
    try {
      await fetch(`${API}/deleteUser.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: id })
      });
      const updated = await fetch(`${API}/getUsers.php`, { credentials: 'include' }).then(r => r.json());
      setUsers(updated.active || []);
      setDeletedUsers(updated.deleted || []);
      const countsRes = await fetch(`${API}/getUserCounts.php`, { credentials: 'include' }).then(r => r.json());
      if (countsRes.counts) setCounts(countsRes.counts);
    } catch (e) {
      console.error('Error deleting user:', e);
    }
  };

  const handleRestore = async id => {
    try {
      await fetch(`${API}/restoreUser.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: id })
      });
      const updated = await fetch(`${API}/getUsers.php`, { credentials: 'include' }).then(r => r.json());
      setUsers(updated.active || []);
      setDeletedUsers(updated.deleted || []);
      const countsRes = await fetch(`${API}/getUserCounts.php`, { credentials: 'include' }).then(r => r.json());
      if (countsRes.counts) setCounts(countsRes.counts);
    } catch (e) {
      console.error('Error restoring user:', e);
    }
  };

  const applyFilters = list =>
    list.filter(u => {
      if (roleFilter && u.role !== roleFilter) return false;
      const q = searchTerm.toLowerCase();
      return (
        u.user_id.toLowerCase().includes(q) ||
        u.teacher_user_id?.toLowerCase().includes(q) ||
        u.first_name.toLowerCase().includes(q) ||
        u.surname.toLowerCase().includes(q)
      );
    });

  const filteredUsers = applyFilters(users);
  const filteredDeleted = applyFilters(deletedUsers);

  const exportCSV = () => {
    const headers = ['user_id', 'teacher_user_id', 'first_name', 'middle_name', 'surname', 'email', 'role'];
    const rows = filteredUsers.map(u => headers.map(h => u[h]));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 container mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#295A12]">Admin Dashboard</h2>
        <p className="text-lg text-[#398908] mt-1">
          Welcome back, <span className="font-semibold text-[#295A12]">{adminName}</span>!
        </p>
      </div>

      {/* Stats and Add */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-4">
          <div className="bg-[#C6E90E]/20 px-3 py-2 rounded text-[#295A12] font-semibold">
            Teachers: {counts.Teacher}
          </div>
          <div className="bg-[#C6E90E]/20 px-3 py-2 rounded text-[#295A12] font-semibold">
            Students: {counts.Student}
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto bg-[#295A12] hover:bg-[#398908] text-white px-4 py-2 rounded w-full sm:w-auto transition"
        >
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, User ID, or Teacher ID"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="p-2 border border-[#87DC3F] rounded flex-1 w-full focus:outline-none focus:ring-2 focus:ring-[#C6E90E]"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="p-2 border border-[#87DC3F] rounded w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-[#C6E90E]"
        >
          <option value="">All Roles</option>
          <option value="Teacher">Teacher</option>
          <option value="Student">Student</option>
        </select>
        <button
          onClick={exportCSV}
          className="bg-[#87DC3F] hover:bg-[#C6E90E] text-[#295A12] px-4 py-2 rounded w-full sm:w-auto font-semibold transition"
        >
          Export CSV
        </button>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto mb-6">
        <UserList
          users={filteredUsers}
          deletedUsers={filteredDeleted}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      </div>

      {/* Add User Modal */}
      {showModal && (
        <AddUserModal
          teacherNextId={nextIds.Teacher}
          studentNextId={nextIds.Student}
          onClose={() => {
            setShowModal(false);
            fetch(`${API}/getUsers.php`, { credentials: 'include' })
              .then(r => r.json())
              .then(data => {
                setUsers(data.active || []);
                setDeletedUsers(data.deleted || []);
              });
            fetch(`${API}/getUserCounts.php`, { credentials: 'include' })
              .then(r => r.json())
              .then(cRes => cRes.counts && setCounts(cRes.counts));
          }}
        />
      )}
    </div>
  );
}
