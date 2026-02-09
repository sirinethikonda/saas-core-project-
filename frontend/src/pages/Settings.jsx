import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Lock, Activity, Save, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

export default function Settings() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [logs, setLogs] = useState([]);

  // Form States
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '', // Read-only usually
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({ fullName: user.fullName, email: user.email });
      fetchAuditLogs();
    }
  }, [user]);

  const fetchAuditLogs = async () => {
    try {
      const res = await apiClient.get('/audit-logs');
      const data = res.data?.data || res.data || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await apiClient.put(`/users/${user.id}`, {
        fullName: profileForm.fullName
      });

      // Fix: Handle 200 OK responses with success: false
      if (res.data && res.data.success === false) {
        setMessage({ type: 'error', text: res.data.message });
        return;
      }

      // Update local context
      const updatedUser = res.data?.data || res.data;
      if (updatedUser) {
        // We need to merge with existing token info, or just update user object
        // Assuming login() handles updating the user object in localStorage
        const token = localStorage.getItem('token');
        login({ token, user: updatedUser });
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setMessage({ type: 'error', text: "Passwords do not match." });
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await apiClient.put(`/users/${user.id}`, {
        password: passwordForm.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <SettingsIcon size={36} className="text-primary" />
          Settings & Profile
        </h1>
        <p className="text-gray-500 font-medium mt-2">Manage your account and view activity.</p>
      </header>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-2 font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
          {message.type === 'success' ? <Activity size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="grid gap-8">
        {/* Profile Section */}
        <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <User size={22} className="text-primary" />
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Personal Details</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Full Name</label>
              <input
                type="text"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 outline-primary"
                value={profileForm.fullName}
                onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Email (Read-Only)</label>
              <input
                type="text" disabled
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-500 cursor-not-allowed"
                value={profileForm.email}
              />
            </div>

            <div className="md:col-span-2">
              <button disabled={loading} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Update Profile</>}
              </button>
            </div>
          </form>
        </section>

        {/* Password Section - Feature Unlocked */}
        <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <Lock size={22} className="text-orange-500" />
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Security & Password</h2>
          </div>

          <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">New Password</label>
              <input
                type="password" required minLength="6"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 outline-orange-500"
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Confirm Password</label>
              <input
                type="password" required minLength="6"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 outline-orange-500"
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <button disabled={loading} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-100 hover:bg-orange-600 transition disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <><Shield size={18} /> Change Password</>}
              </button>
            </div>
          </form>
        </section>

        {/* Unique Feature: Activity Log */}
        <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <Activity size={22} className="text-purple-500" />
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Activity Log</h2>
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <p className="font-bold text-gray-700 text-sm">{log.details}</p>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase mt-2 md:mt-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 italic">No activity recorded yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}