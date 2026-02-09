import { useState, useEffect } from 'react';
import { X, Loader2, Save, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

/**
 * Requirement 4.3: Create/Edit Project Modal
 * This component handles both creation and updates of projects.
 */
export default function ProjectModal({ isOpen, onClose, onSuccess, project = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  // Requirement 4.3: Populate form if editing existing project
  useEffect(() => {
    if (project) {
      setForm({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active'
      });
    } else {
      setForm({ name: '', description: '', status: 'active' });
    }
    setError(''); // Clear errors when modal toggles
  }, [project, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Requirement 4.3: Client-side Validation
    if (form.name.trim().length < 3) {
      return setError("Project name must be at least 3 characters.");
    }

    setLoading(true);
    try {
      let res;
      if (project) {
        // Requirement 4.3: API Integration - PUT for edit
        res = await apiClient.put(`/projects/${project.id}`, form);
      } else {
        // Requirement 4.3: API Integration - POST for create
        res = await apiClient.post('/projects', form);
      }

      // Fix: Handle 200 OK responses with success: false (Business Logic Errors)
      if (res.data && res.data.success === false) {
        setError(res.data.message);
        return;
      }

      onSuccess(); // Refresh the list in parent component
      onClose();   // Close modal on success
    } catch (err) {
      // Requirement 5.1: Handle Plan Limit Errors and 500 crashes
      const msg = err.response?.data?.message || "Failed to save project. Check your plan limits or connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform transition-all scale-100">

        {/* Requirement 4.3: Header with Close Action */}
        <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Requirement 4.3: Form Fields */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-2 animate-shake">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">
              Project Name *
            </label>
            <input
              required
              type="text"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">
              Description
            </label>
            <textarea
              rows="3"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium resize-none"
              placeholder="Briefly describe the goals..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">
              Status
            </label>
            <select
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-gray-600 cursor-pointer appearance-none"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Requirement 4.3: Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-primary-600 shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <><Save size={20} /> Save Project</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}