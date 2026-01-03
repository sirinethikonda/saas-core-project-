import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { 
  Folder, ListChecks, CheckCircle, Clock, 
  Loader2, ChevronRight, Layout, Plus, Activity
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { projects: 0, tasks: 0, completed: 0, pending: 0 },
    recentProjects: []
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/projects');
      
      const projects = res.data?.data?.projects || 
                       res.data?.projects || 
                       res.data?.content || 
                       (Array.isArray(res.data) ? res.data : []);

      const totalT = projects.reduce((acc, p) => acc + (p.taskCount || 0), 0);
      const compT = projects.reduce((acc, p) => acc + (p.completedTaskCount || 0), 0);

      setData({
        stats: {
          projects: projects.length,
          tasks: totalT,
          completed: compT,
          pending: totalT - compT
        },
        recentProjects: projects.slice(0, 5)
      });
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  return (
    <div className="p-6 md:p-10 space-y-10 bg-gray-50 min-h-screen animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Welcome back, <span className="text-primary">{user?.fullName || 'Member'}</span>
          </h1>
          <p className="text-gray-500 font-medium">Viewing <span className="font-bold text-gray-700 capitalize">{user?.role?.replace('_', ' ')}</span> workspace.</p>
        </div>
        <button 
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} /> New Project
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Projects', val: data.stats.projects, icon: Folder, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Tasks', val: data.stats.tasks, icon: ListChecks, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Completed', val: data.stats.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending', val: data.stats.pending, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' }
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-3xl font-black text-gray-900">{s.val}</p>
            </div>
            <div className={`p-4 rounded-2xl ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}><s.icon size={26} /></div>
          </div>
        ))}
      </div>

      {/* Recent Projects List */}
      <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-2">
          <Activity size={20} className="text-primary" /> Active Workspaces
        </h2>
        <div className="grid gap-4">
          {data.recentProjects.length > 0 ? data.recentProjects.map(p => (
            <div 
              key={p.id} 
              onClick={() => navigate(`/projects/${p.id}`)} 
              className="flex items-center justify-between p-5 bg-gray-50 hover:bg-white border border-transparent hover:border-primary rounded-[24px] cursor-pointer transition-all group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary font-black shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800 group-hover:text-primary transition-colors">{p.name}</p>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">{p.status || 'Active'}</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
            </div>
          )) : (
            <p className="text-center py-10 text-gray-400 italic">No projects found in this tenant.</p>
          )}
        </div>
      </section>
    </div>
  );
}