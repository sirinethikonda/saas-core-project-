import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { X, Loader2, AlertCircle } from 'lucide-react';

export default function UserModal({ isOpen, onClose, onSuccess, user = null }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync form state when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setForm({
          fullName: user.fullName || '',
          email: user.email || '',
          role: user.role || 'user',
          password: '' // Keep password empty for edits
        });
      } else {
        setForm({ fullName: '', email: '', password: '', role: 'user' });
      }
      setError('');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tenantId = localStorage.getItem('tenantId');

      let res;
      if (user) {
        // Edit Mode: PUT /api/users/:id
        // Filter out password if it wasn't typed to avoid overwriting with empty string
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;

        res = await apiClient.put(`/users/${user.id}`, updateData);
      } else {
        // Create Mode: POST /api/tenants/:tenantId/users
        if (!form.password) throw new Error("Password is required for new members");
        res = await apiClient.post(`/tenants/${tenantId}/users`, form);
      }

      // Fix: Handle 200 OK responses with success: false (Business Logic Errors)
      if (res.data && res.data.success === false) {
        setError(res.data.message);
        return;
      }

      // CRITICAL: Refresh the parent list and close
      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error saving member");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            {user ? 'Edit Member' : 'Add New Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-bold">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Full Name</label>
            <input
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-primary font-medium focus:bg-white transition-all"
              placeholder="John Doe"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Email Address</label>
            <input
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-primary font-medium focus:bg-white transition-all"
              placeholder="john@example.com"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">
              Password {user && '(Leave blank to keep current)'}
            </label>
            <input
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-primary font-medium focus:bg-white transition-all"
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required={!user}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">Access Role</label>
            <select
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-primary font-bold text-gray-600 appearance-none cursor-pointer focus:bg-white transition-all"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">Standard User</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>
          </div>

          <button
            disabled={loading}
            className="w-full bg-primary-600 text-white p-4 rounded-2xl font-black flex justify-center shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Save Member'}
          </button>
        </form>
      </div>
    </div>
  );
}