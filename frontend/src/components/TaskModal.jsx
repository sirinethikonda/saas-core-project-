import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { X, Loader2, AlertCircle, Calendar, Flag } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, projectId, onSuccess }) {
  const initialState = { title: '', priority: 'medium', status: 'todo', dueDate: '' };
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) { setForm(initialState); setError(''); }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Task description is required.");
    
    setLoading(true);
    setError('');
    try {
      await apiClient.post(`/projects/${projectId}/tasks`, form);
      if (onSuccess) await onSuccess(); 
      onClose();
    } catch (err) {
      console.error("Backend Task Error:", err.response?.data);
      setError(err.response?.data?.message || "Internal Server Error (500). Please check project existence.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Assign Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><X size={24} /></button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-shake">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Title</label>
            <input className="w-full p-4 bg-gray-50 border rounded-2xl outline-primary font-medium" placeholder="Task details..." value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Priority</label>
              <select className="w-full p-4 bg-gray-50 border rounded-2xl outline-primary font-bold text-gray-600" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Deadline</label>
              <input type="date" className="w-full p-4 bg-gray-50 border rounded-2xl outline-primary font-bold text-gray-600" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-primary text-white p-4 rounded-2xl font-black flex justify-center items-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Publish Task"}
          </button>
        </form>
      </div>
    </div>
  );
}