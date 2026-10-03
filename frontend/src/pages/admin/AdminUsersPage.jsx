import React, { useState, useEffect } from 'react';
import { Search, Shield, User, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import Skeleton from '../../components/common/Skeleton';

const AdminUsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search || undefined,
      };
      const res = await adminService.getAllUsers(params);
      if (res.success) {
        setUsers(res.data);
        setTotalPages(res.pagination?.pages || 1);
        setTotalUsers(res.pagination?.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await adminService.toggleUserStatus(user._id);
      if (res.success) {
        toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        toast.success(`Role updated to ${newRole}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Customer & User Accounts</h1>
          <p className="text-xs text-neutral-500 mt-1">Manage platform members, permissions, and status ({totalUsers} users total)</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
        </form>

        <button
          onClick={fetchUsers}
          title="Refresh"
          className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold text-xs uppercase border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">{u.name}</p>
                          <p className="text-xs text-neutral-400">ID: {u._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-neutral-800 text-xs font-medium">{u.email}</p>
                      <p className="text-neutral-400 text-xs">{u.phone || 'No phone'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2 py-1 border border-neutral-200 focus:outline-none ${
                          u.role === 'admin' ? 'bg-purple-50 text-purple-800' : 'bg-neutral-50 text-neutral-800'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-xs">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          u.isActive !== false
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-neutral-500 text-sm">
            No users found matching query.
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
