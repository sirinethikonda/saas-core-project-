import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Lock, Mail, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    tenantSubdomain: '',
    rememberMe: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // API Integration: Requirement 4.1.2
      const res = await apiClient.post('/auth/login', {
        email: form.email,
        password: form.password,
        tenantSubdomain: form.tenantSubdomain
      });

      if (res.data.success) {
        // Store token and user info in Context & LocalStorage
        login(res.data.data);
        navigate('/dashboard');
      }
    } 	  catch (err) {
	    // This helps you see if it's a 401 (Auth), 404 (Tenant Not Found), or 500 (Server Error)
	    const status = err.response?.status;
	    const message = err.response?.data?.message || "Invalid credentials or subdomain";
	    alert(`Error ${status}: ${message}`);
	    console.log("Full Error Object:", err.response);
	  }finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your organization dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-danger text-sm font-bold rounded-xl border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          {/* Subdomain Input */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-1">Organization Subdomain</label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 text-gray-300" size={20} />
              <input 
                type="text" required 
                placeholder="company-name"
                className="w-full p-3 pl-10 bg-gray-50 border rounded-xl outline-primary transition-all focus:bg-white"
                onChange={e => setForm({...form, tenantSubdomain: e.target.value})}
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-300" size={20} />
              <input 
                type="email" required 
                placeholder="admin@company.com"
                className="w-full p-3 pl-10 bg-gray-50 border rounded-xl outline-primary transition-all focus:bg-white"
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-300" size={20} />
              <input 
                type="password" required 
                placeholder="••••••••"
                className="w-full p-3 pl-10 bg-gray-50 border rounded-xl outline-primary transition-all focus:bg-white"
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" className="w-4 h-4 rounded text-primary" 
                onChange={e => setForm({...form, rememberMe: e.target.checked})}
              />
              <span className="text-xs text-gray-500">Remember me</span>
            </label>
            <a href="#" className="text-xs text-primary font-bold hover:underline">Forgot Password?</a>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-primary text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:bg-gray-300"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In to Dashboard"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            New organization? <Link to="/register" className="text-primary font-bold hover:underline">Register Tenant</Link>
          </p>
        </form>
      </div>
    </div>
  );
}