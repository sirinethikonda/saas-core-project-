import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, Trash2, Edit3, ArrowLeft, Loader2, Save, X,
  Flag, Filter
} from 'lucide-react';
import apiClient from '../api/apiClient';
import TaskModal from '../components/TaskModal';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Requirement 4.3: Filter state for real-time task narrowing
  const [filters, setFilters] = useState({ status: 'all', priority: 'all' });

  /**
   * API INTEGRATION: GET Project and Tasks
   * Robust data picker handles wrapped or flat Spring Boot JSON responses.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, taskRes] = await Promise.all([
        apiClient.get(`/projects/${id}`),
        apiClient.get(`/projects/${id}/tasks`)
      ]);

      // Extraction logic for Project
      const projectData = projRes.data.data?.project || projRes.data.project || projRes.data;

      // Extraction logic for Tasks - FIX: Handle direct array vs nested vs wrapped
      let tasksData = [];
      if (Array.isArray(taskRes.data)) {
        tasksData = taskRes.data;
      } else if (Array.isArray(taskRes.data?.data)) {
        tasksData = taskRes.data.data;
      } else if (Array.isArray(taskRes.data?.data?.tasks)) {
        tasksData = taskRes.data.data.tasks;
      } else if (Array.isArray(taskRes.data?.tasks)) {
        tasksData = taskRes.data.tasks;
      }

      // Normalize status to lowercase
      const normalizedTasks = tasksData.map(t => ({
        ...t,
        status: t.status ? t.status.toLowerCase() : 'todo'
      }));

      setProject(projectData);
      setEditedTitle(projectData?.name || '');
      setTasks(normalizedTasks);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * API INTEGRATION: PUT /api/projects/:id (Inline Update)
   */
  const handleUpdateProjectName = async () => {
    if (!editedTitle.trim() || editedTitle === project?.name) return setIsEditingTitle(false);
    try {
      await apiClient.put(`/projects/${id}`, { ...project, name: editedTitle });
      setProject({ ...project, name: editedTitle });
      setIsEditingTitle(false);
    } catch (err) {
      alert("Update failed. Check organization permissions.");
    }
  };

  /**
   * API INTEGRATION: PATCH /api/tasks/:id/status
   */
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
      // Optimistic state update for instant UI feedback
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert("Status update failed");
    }
  };

  /**
   * API INTEGRATION: DELETE /api/tasks/:id
   */
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Permanently delete this task?")) {
      try {
        await apiClient.delete(`/tasks/${taskId}`);
        setTasks(prev => prev.filter(t => t.id !== taskId));
      } catch (err) {
        alert("Delete operation failed");
      }
    }
  };

  /**
   * FILTERING ENGINE
   * Narrow down tasks based on priority and status selections.
   */
  const filteredTasks = tasks.filter(task => {
    const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
    const statusMatch = filters.status === 'all' || task.status === filters.status;
    return priorityMatch && statusMatch;
  });

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-primary-600" size={40} />
    </div>
  );

  const taskGroups = ['todo', 'in_progress', 'completed'];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Navigation */}
        <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-gray-400 hover:text-primary-600 font-bold mb-6 transition group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Projects
        </button>

        {/* PROJECT HEADER */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 w-full max-w-md animate-in slide-in-from-left-2">
                    <input
                      className="text-3xl font-black text-gray-900 bg-gray-50 border-b-2 border-primary-600 outline-none px-2 w-full"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onBlur={handleUpdateProjectName}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateProjectName()}
                      autoFocus
                    />
                    <button onClick={handleUpdateProjectName} className="p-2 bg-primary-600 text-white rounded-lg"><Save size={18} /></button>
                  </div>
                ) : (
                  <>
                    <h1
                      className="text-4xl font-black text-gray-900 tracking-tight cursor-pointer hover:text-primary-600 transition-colors"
                      onDoubleClick={() => setIsEditingTitle(true)}
                    >
                      {project?.name}
                    </h1>
                    <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-blue-50 text-primary-600">
                      {project?.status || 'Active'}
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-500 font-medium leading-relaxed max-w-3xl">
                {project?.description || 'No description available for this project.'}
              </p>
            </div>
            <button onClick={() => setIsEditingTitle(true)} className="p-3 bg-gray-50 text-gray-400 hover:text-primary-600 rounded-xl transition-all border border-transparent hover:border-gray-100">
              <Edit3 size={20} />
            </button>
          </div>
        </div>

        {/* WORKSPACE TOOLS */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            Workspace <span className="text-gray-300 font-medium ml-1">({tasks.length})</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <select
                className="pl-10 pr-8 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 outline-none appearance-none cursor-pointer shadow-sm"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <option value="all">Priority: All</option>
                <option value="high">Priority: High</option>
                <option value="medium">Priority: Medium</option>
                <option value="low">Priority: Low</option>
              </select>
            </div>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95"
            >
              <Plus size={20} /> New Task
            </button>
          </div>
        </div>

        {/* KANBAN TABLES */}
        <div className="space-y-10">
          {taskGroups.map(group => (
            <div key={group} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${group === 'todo' ? 'bg-blue-400' : group === 'in_progress' ? 'bg-orange-400' : 'bg-green-400'}`}></div>
                  {group.replace('_', ' ')}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-50">
                    {filteredTasks.filter(t => t.status === group).length > 0 ? (
                      filteredTasks.filter(t => t.status === group).map(task => (
                        <tr key={task.id} className="group hover:bg-gray-50/20 transition-all">
                          <td className="py-6 px-8 min-w-[300px]">
                            <p className="font-bold text-gray-800 text-lg">{task.title}</p>
                            <span className="text-[10px] text-gray-300 font-black uppercase">UID: {task.id?.slice(0, 8)}</span>
                          </td>
                          <td className="py-6 px-4">
                            <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg w-fit ${task.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                              <Flag size={10} /> {task.priority}
                            </span>
                          </td>
                          <td className="py-6 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 font-black text-xs uppercase shadow-inner">
                                {task.assignedUser?.fullName?.charAt(0) || 'U'}
                              </div>
                              <p className="text-sm font-bold text-gray-700 truncate max-w-[140px]">
                                {task.assignedUser?.fullName || 'Unassigned'}
                              </p>
                            </div>
                          </td>
                          <td className="py-6 px-4 text-gray-400 text-xs font-bold">
                            <div className="flex items-center gap-1.5 opacity-60"><Calendar size={14} /> {task.dueDate || 'No Deadline'}</div>
                          </td>
                          <td className="py-6 px-8 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <select
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="text-[10px] font-black uppercase border border-gray-100 rounded-lg px-3 py-1.5 bg-white cursor-pointer hover:border-primary-600 transition-colors outline-none"
                                value={task.status}
                              >
                                {taskGroups.map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
                              </select>
                              <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-16 text-center text-gray-300 font-bold italic">
                          No tasks in the "{group.replace('_', ' ')}" column.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* TaskModal Integration with onSuccess callback to trigger fetchData */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          projectId={id}
          onSuccess={fetchData}
        />
      </div>
    </div>
  );
}