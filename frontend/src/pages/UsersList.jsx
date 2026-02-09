import { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { UserPlus, Search, Trash2, Edit3, Loader2, Mail, Shield, Filter, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import UserModal from '../components/UserModal';

export default function UsersList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  if (currentUser?.role !== 'tenant_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const tenantId = localStorage.getItem('tenantId');
      const res = await apiClient.get(`/tenants/${tenantId}/users`);
      // Fix: Handle both wrapped List and potential nested checks
      const userData = res.data?.data?.users ||
        (Array.isArray(res.data?.data) ? res.data.data : []) ||
        res.data?.users ||
        res.data;
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error("User Fetch Error", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (userId, userName) => {
    if (userId === currentUser.id) return alert("Security Check: You cannot delete your own admin account.");
    if (window.confirm(`Permanently remove ${userName} from team?`)) {
      try {
        await apiClient.delete(`/users/${userId}`);
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (err) { alert("Deletion failed. User may have active project assignments."); }
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(u => {
    const matchesSearch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Team Management</h1>
            <p className="text-gray-400 font-medium">Manage access and roles for your organization.</p>
          </div>
          <button onClick={() => { setSelectedUser(null); setIsModalOpen(true); }} className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
            <UserPlus size={20} /> Add Member
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Filter by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-primary-600/20 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="px-6 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-gray-600 outline-none cursor-pointer" onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">Access: All Roles</option>
            <option value="tenant_admin">Access: Admin</option>
            <option value="user">Access: Standard</option>
          </select>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-primary-600" size={40} />
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Syncing Directory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="p-6">Member Identity</th>
                    <th className="p-6">Role / Authority</th>
                    <th className="p-6">Account Status</th>
                    <th className="p-6 text-right">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="p-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary-600/10 text-primary-600 rounded-xl flex items-center justify-center font-black">{u.fullName?.charAt(0)}</div>
                        <div><p className="font-bold text-gray-800">{u.fullName}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                      </td>
                      <td className="p-6 text-[10px] font-black uppercase text-gray-500">{u.role?.replace('_', ' ')}</td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.status === 'active' || !u.status ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-6 text-right space-x-1">
                        <button onClick={() => { setSelectedUser(u); setIsModalOpen(true); }} className="p-2.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                        <button onClick={() => handleDelete(u.id, u.fullName)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="py-20 text-center text-gray-300 font-bold italic">No matching members found.</div>}
            </div>
          )}
        </div>
        <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchUsers} user={selectedUser} />
      </div>
    </div>
  );
}