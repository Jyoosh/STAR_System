// src/components/Admin/UserList.js
import React, { useState, useMemo } from 'react';
import { GraduationCap, BookUser, Trash2, RefreshCw } from 'lucide-react';

export default function UserList({
  users = [],
  deletedUsers = [],
  onDelete,
  onRestore
}) {
  const [sortBy, setSortBy] = useState({ key: 'user_id', asc: true });
  const [activeTab, setActiveTab] = useState('active');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState({ id: null, action: '' });
  const pageSize = 10;

  const displayUsers = activeTab === 'active' ? users : deletedUsers;

  const sortedUsers = useMemo(() => {
    const list = [...displayUsers];
    list.sort((a, b) => {
      const aV = a[sortBy.key] || '';
      const bV = b[sortBy.key] || '';
      if (aV < bV) return sortBy.asc ? -1 : 1;
      if (aV > bV) return sortBy.asc ? 1 : -1;
      return 0;
    });
    return list;
  }, [displayUsers, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, page]);

  const toggleAll = e => {
    setSelected(e.target.checked ? new Set(sortedUsers.map(u => u.id)) : new Set());
  };

  const toggleOne = id => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const RoleIcon = ({ role }) =>
    role === 'Teacher' ? (
      <BookUser className="inline-block w-4 h-4 text-blue-600 ml-1" title="Teacher" />
    ) : (
      <GraduationCap className="inline-block w-4 h-4 text-green-600 ml-1" title="Student" />
    );

  if (!users.length && !deletedUsers.length) return <p>No users available.</p>;

  return (
    <>
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => {
            setActiveTab('active');
            setPage(1);
          }}
        >
          Active Users ({users.length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'deleted' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => {
            setActiveTab('deleted');
            setPage(1);
          }}
        >
          Deleted Users ({deletedUsers.length})
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border">
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={selected.size === sortedUsers.length && sortedUsers.length > 0}
                />
              </th>
              <th
                className="p-2 border cursor-pointer"
                onClick={() => setSortBy(s => ({ key: 'record_id', asc: s.key === 'record_id' ? !s.asc : true }))}
              >
                <div className="flex items-center">
                  Record ID
                  {sortBy.key === 'record_id' && <span className="ml-1">{sortBy.asc ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th
                className="p-2 border cursor-pointer"
                onClick={() => setSortBy(s => ({ key: 'user_id', asc: s.key === 'user_id' ? !s.asc : true }))}
              >
                <div className="flex items-center">
                  User ID
                  {sortBy.key === 'user_id' && <span className="ml-1">{sortBy.asc ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th
                className="p-2 border cursor-pointer"
                onClick={() => setSortBy(s => ({ key: 'teacher_user_id', asc: s.key === 'teacher_user_id' ? !s.asc : true }))}
              >
                <div className="flex items-center">
                  Teacher ID
                  {sortBy.key === 'teacher_user_id' && <span className="ml-1">{sortBy.asc ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th
                className="p-2 border cursor-pointer"
                onClick={() => setSortBy(s => ({ key: 'surname', asc: s.key === 'surname' ? !s.asc : true }))}
              >
                <div className="flex items-center">
                  Name
                  {sortBy.key === 'surname' && <span className="ml-1">{sortBy.asc ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th
                className="p-2 border cursor-pointer"
                onClick={() => setSortBy(s => ({ key: 'email', asc: s.key === 'email' ? !s.asc : true }))}
              >
                <div className="flex items-center">
                  Email
                  {sortBy.key === 'email' && <span className="ml-1">{sortBy.asc ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(u => (
              <tr key={u.id} className={`border-b ${activeTab === 'deleted' ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    onChange={() => toggleOne(u.id)}
                  />
                </td>
                <td className="p-2 whitespace-nowrap">{u.record_id}</td>
                <td className="p-2 whitespace-nowrap">
                  {u.user_id} <RoleIcon role={u.role} />
                  {activeTab === 'deleted' && (
                    <span className="ml-2 text-xs text-red-600">(Deleted)</span>
                  )}
                </td>
                <td className="p-2 whitespace-nowrap">
                  {u.teacher_user_id || '-'}
                </td>
                <td className="p-2">
                  {u.first_name} {u.middle_name ? `${u.middle_name} ` : ''}{u.surname}
                </td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 space-x-2">
                  {activeTab === 'active' ? (
                    <button
                      onClick={() => setConfirmAction({ id: u.id, action: 'delete' })}
                      className="text-red-600 hover:text-red-800"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmAction({ id: u.id, action: 'restore' })}
                      className="text-green-600 hover:text-green-800"
                      title="Restore user"
                    >
                      <RefreshCw size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {paged.map(u => (
          <div
            key={u.id}
            className={`border rounded p-4 shadow-sm ${activeTab === 'deleted' ? 'bg-red-50' : 'bg-white'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold flex items-center">
                  <RoleIcon role={u.role} />
                  <span className="ml-1">
                    {u.first_name} {u.surname}
                    {activeTab === 'deleted' && (
                      <span className="ml-2 text-xs text-red-600">(Deleted)</span>
                    )}
                  </span>
                </h3>
                <p className="text-sm text-gray-600">Record ID: {u.record_id}</p>
                <p className="text-sm text-gray-600">User ID: {u.user_id}</p>
                {u.teacher_user_id && (
                  <p className="text-sm text-gray-600">Teacher ID: {u.teacher_user_id}</p>
                )}
              </div>
              <div>
                {activeTab === 'active' ? (
                  <button
                    onClick={() => setConfirmAction({ id: u.id, action: 'delete' })}
                    className="text-red-600 hover:text-red-800"
                    title="Delete user"
                  >
                    <Trash2 size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmAction({ id: u.id, action: 'restore' })}
                    className="text-green-600 hover:text-green-800"
                    title="Restore user"
                  >
                    <RefreshCw size={18} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm"><strong>Email:</strong> {u.email}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div>
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedUsers.length)} of {sortedUsers.length} {activeTab} users
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction.id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              {confirmAction.action === 'delete' ? 'Confirm Deletion' : 'Confirm Restoration'}
            </h2>
            <p className="mb-4">
              {confirmAction.action === 'delete'
                ? 'Are you sure you want to delete this user?'
                : 'Are you sure you want to restore this user?'}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmAction({ id: null, action: '' })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmAction.action === 'delete'
                    ? onDelete(confirmAction.id)
                    : onRestore(confirmAction.id);
                  setConfirmAction({ id: null, action: '' });
                }}
                className={`px-4 py-2 text-white rounded ${confirmAction.action === 'delete' ? 'bg-red-600' : 'bg-green-600'
                  }`}
              >
                {confirmAction.action === 'delete' ? 'Delete' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
