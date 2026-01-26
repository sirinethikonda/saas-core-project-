import { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import apiClient from '../api/apiClient';
import MyTasks from '../components/MyTasks';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/tasks');
            const data = res.data?.data || res.data || [];
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">All Tasks</h1>
                <p className="text-gray-500 font-medium mt-2">Manage tasks across all projects.</p>
            </header>

            <div className="h-[600px]">
                <MyTasks tasks={tasks} />
            </div>
        </div>
    );
}
