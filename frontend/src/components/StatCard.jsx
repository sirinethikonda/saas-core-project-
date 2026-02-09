import React from 'react';
import { Card } from './ui/Card';

export const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <Card hover className="flex items-center justify-between group">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
          {title}
        </p>
        <p className="text-3xl font-display font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
          {value}
        </p>
      </div>
      <div className={`p-4 rounded-2xl ${color.bg} ${color.text} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </Card>
  );
};