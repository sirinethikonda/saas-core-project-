import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  Folder, ListChecks, CheckCircle, Clock,
  Loader2, ChevronRight, Plus, Activity
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
        (Array.isArray(res.data?.data) ? res.data.data : []) ||
        res.data?.projects ||
        res.data?.content ||
        (Array.isArray(res.data) ? res.data : []);

      const totalT = projects.reduce((acc, p) => acc + (p.taskCount || 0), 0);
      const compT = projects.reduce((acc, p) => acc + (p.completedTaskCount || 0), 0);

      setData({
        stats: {
          projects: projects.length, // Keep explicit "Total Projects"
          tasks: totalT,
          completed: compT,
          pending: totalT - compT
        },
        // Filter: Only show active projects in the "Active Workspaces" list
        recentProjects: projects.filter(p => p.status === 'active').slice(0, 5)
      });
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
            Welcome back, <span className="text-primary-600">{user?.fullName || 'Member'}</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Viewing <span className="font-semibold text-gray-700 capitalize">{user?.role?.replace('_', ' ')}</span> workspace overview.
          </p>
        </div>
        <Button
          onClick={() => navigate('/projects')}
          size="lg"
          className="shadow-xl shadow-primary-500/20 active:scale-95 transition-transform"
        >
          <Plus size={20} className="mr-2" /> New Project
        </Button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Projects', val: data.stats.projects, icon: Folder, color: { text: 'text-blue-600', bg: 'bg-blue-50' } },
          { label: 'Total Tasks', val: data.stats.tasks, icon: ListChecks, color: { text: 'text-indigo-600', bg: 'bg-indigo-50' } },
          { label: 'Completed', val: data.stats.completed, icon: CheckCircle, color: { text: 'text-green-600', bg: 'bg-green-50' } },
          { label: 'Pending', val: data.stats.pending, icon: Clock, color: { text: 'text-orange-600', bg: 'bg-orange-50' } }
        ].map(s => (
          <StatCard
            key={s.label}
            title={s.label}
            value={s.val}
            icon={s.icon}
            color={s.color}
          />
        ))}
      </div>

      {/* Recent Projects List */}
      <section className="space-y-6">
        <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
          <Activity size={24} className="text-primary-600" /> Active Workspaces
        </h2>

        <div className="grid gap-4">
          {data.recentProjects.length > 0 ? data.recentProjects.map(p => (
            <Card
              key={p.id}
              hover
              onClick={() => navigate(`/projects/${p.id}`)}
              className="flex items-center justify-between p-5 cursor-pointer group border-transparent hover:border-primary-100"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-primary-600 font-bold text-lg shadow-inner group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors text-lg">{p.name}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 uppercase tracking-wide mt-1">
                    {p.status || 'Active'}
                  </span>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-primary-500 transition-all duration-300 translate-x-0 group-hover:translate-x-1" />
            </Card>
          )) : (
            <div className="text-center py-16 bg-white rounded-[24px] border border-dashed border-gray-200">
              <Folder size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No projects found in this workspace.</p>
              <Button
                variant="ghost"
                className="mt-4 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                onClick={() => navigate('/projects')}
              >
                Create your first project
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}