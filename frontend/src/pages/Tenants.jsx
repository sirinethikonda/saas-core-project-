import { useEffect, useState } from 'react';
import {
    Search, Globe, Loader2, AlertCircle, Users, Briefcase
} from 'lucide-react';
import apiClient from '../api/apiClient';

export default function Tenants() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/tenants');
            const data = res.data?.data?.content || res.data?.data || res.data || [];
            setTenants(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch tenants", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTenants(); }, []);

    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.subdomain?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Organizations</h1>
                        <p className="text-gray-500 font-medium">Monitor all registered tenants across the platform.</p>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or subdomain..."
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
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>

                {/* GRID */}
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
                ) : filteredTenants.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTenants.map((tenant) => (
                            <div key={tenant.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-600 group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Globe size={24} />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${tenant.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {tenant.status}
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-gray-800 mb-1 group-hover:text-blue-600 transition">{tenant.name}</h3>
                                <p className="text-gray-400 text-sm font-mono mb-6">@{tenant.subdomain}</p>

                                <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-50 text-sm">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Users size={12} /> Users</p>
                                        <p className="font-bold text-gray-700">{tenant.maxUsers ? `Max ${tenant.maxUsers}` : 'Unlimited'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Briefcase size={12} /> Projects</p>
                                        <p className="font-bold text-gray-700">{tenant.maxProjects ? `Max ${tenant.maxProjects}` : 'Unlimited'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                        {tenant.subscriptionPlan || 'Free'} Plan
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-300 italic">
                                        {new Date(tenant.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-20 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                        <AlertCircle size={40} className="text-gray-300 mb-4" />
                        <h2 className="text-2xl font-black text-gray-800 mb-2">No Organizations Found</h2>
                        <p className="text-gray-500 mb-6 max-w-sm">No tenants match your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
