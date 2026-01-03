import React from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth(); // Requirement 4.2: Display current user info

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <SettingsIcon size={36} className="text-primary" /> 
          Settings
        </h1>
        <p className="text-gray-500 font-medium mt-2">Manage your account preferences and organization profile.</p>
      </header>

      <div className="grid gap-8">
        {/* User Profile Section - Requirement 4.2 */}
        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-hover hover:shadow-md">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <User size={22} className="text-primary"/> 
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Personal Profile</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Full Name</label>
              <p className="text-lg font-bold text-gray-800 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                {user?.fullName || 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</label>
              <p className="text-lg font-bold text-gray-800 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                {user?.email || 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User Role</label>
              <div>
                <span className="inline-flex items-center gap-2 bg-blue-50 text-primary px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest border border-blue-100">
                  <Shield size={14} />
                  {user?.role?.replace('_', ' ') || 'User'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Security Placeholder */}
        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm opacity-60">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={20} className="text-gray-400"/>
            <h2 className="text-lg font-bold text-gray-800">Security & Password</h2>
          </div>
          <p className="text-sm text-gray-400 italic">Password management features coming soon in Step 5.</p>
        </section>
      </div>
    </div>
  );
}