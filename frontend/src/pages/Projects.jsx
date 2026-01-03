import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Folder, Trash2, Edit3, 
  ExternalLink, Loader2, AlertCircle 
} from 'lucide-react';
import apiClient from '../api/apiClient';
import ProjectModal from '../components/ProjectModal';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal State Management - Requirement 4.3
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  /**
   * Requirement 4.3: GET /api/projects
   * Fetches all projects for the current tenant.
   */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/projects');
      // Handles various response structures to prevent null crashes
      const data = res.data?.data?.projects || res.data?.data || res.data || [];
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  /**
   * Requirement 4.3: DELETE /api/projects/:id
   * Removes a project after confirmation.
   */
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await apiClient.delete(`/projects/${id}`);
        setProjects(projects.filter(p => p.id !== id));
      } catch (err) {
        alert("Error deleting project.");
      }
    }
  };

  /**
   * Filter Logic - Requirement 4.3
   * Allows searching by name and filtering by status badge.
   */
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION - Requirement 4.3 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Projects</h1>
            <p className="text-gray-500 font-medium">Manage and monitor your team's initiatives.</p>
          </div>
          <button 
            onClick={() => { setSelectedProject(null); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100"
          >
            <Plus size={20} /> Create New Project
          </button>
        </div>

        {/* FILTERS SECTION - Requirement 4.3 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search projects by name..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-600 transition"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* PROJECTS GRID - Requirement 4.3 */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-600 group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Folder size={24} />
                  </div>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                    project.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-blue-600 transition">{project.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-6 h-10">{project.description}</p>

                {/* Requirement 4.3: Task count and Creator */}
                <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-gray-50 text-sm">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tasks</p>
                    <p className="font-bold text-gray-700">{project.taskCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Creator</p>
                    <p className="font-bold text-gray-700 truncate">{project.createdBy?.fullName || 'Admin'}</p>
                  </div>
                </div>

                {/* Requirement 4.3: Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-300 italic">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      title="View Details"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <ExternalLink size={18} />
                    </button>
                    <button 
                      title="Edit Project"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      title="Delete Project"
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                      onClick={() => handleDelete(project.id, project.name)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Requirement 4.3: Empty State Message */
          <div className="bg-white rounded-3xl p-20 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
            <AlertCircle size={40} className="text-gray-300 mb-4" />
            <h2 className="text-2xl font-black text-gray-800 mb-2">No Projects Found</h2>
            <p className="text-gray-500 mb-6 max-w-sm">It looks like you haven't created any projects yet. Get started by creating your first team initiative.</p>
            <button 
               onClick={() => setIsModalOpen(true)}
               className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition"
            >
              Create your first project
            </button>
          </div>
        )}

        {/* MODAL COMPONENT - Requirement 4.3 */}
        <ProjectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchProjects} // Refreshes list after create/edit
          project={selectedProject} 
        />
      </div>
    </div>
  );
}