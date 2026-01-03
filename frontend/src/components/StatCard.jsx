import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
          {title}
        </p>
        <p className="text-3xl font-black text-gray-900">
          {value}
        </p>
      </div>
      <div className={`p-4 rounded-2xl ${color.bg} ${color.text}`}>
        <Icon size={24} strokeWidth={3} />
      </div>
    </div>
  );
};