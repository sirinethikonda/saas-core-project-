// src/components/MyTasks.jsx
import React, { useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export default function MyTasks({ tasks }) {
  const [filter, setFilter] = useState('all');

  // Requirement 4.2: Filter by status
  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
      <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-6">My Tasks</h2>
      
      {/* Requirement 4.2: Status Filter Dropdown */}
      <select 
        className="w-full mb-6 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="all">All Status</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      
      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map(task => (
          <div key={task.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white transition shadow-sm group">
            {/* Requirement 4.2: Show title, project name, priority, due date */}
            <h4 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition">
              {task.title}
            </h4>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-3">
              {task.projectName || 'General Project'}
            </p>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                task.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {task.priority}
              </span>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock size={12} />
                <span className="text-[10px] font-bold">{task.dueDate || 'No Deadline'}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
            <AlertCircle size={40} className="mb-2" />
            <p className="text-sm font-black uppercase tracking-tighter">No tasks found.</p>
          </div>
        )}
      </div>
    </div>
  );
}