import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Lock, Mail, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

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
      const res = await apiClient.post('/auth/login', {
        email: form.email,
        password: form.password,
        tenantSubdomain: form.tenantSubdomain
      });

      if (res.data.success) {
        login(res.data.data);
        navigate('/dashboard');
      }
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || "Invalid credentials or subdomain";
      setError(`Error ${status || 'Unknown'}: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 shadow-2xl shadow-primary-900/10 border-white/50 backdrop-blur-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-6">
            <Lock size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your organization dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-3 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Organization Subdomain"
              icon={Globe}
              placeholder="company-name"
              required
              value={form.tenantSubdomain}
              onChange={e => setForm({ ...form, tenantSubdomain: e.target.value })}
            />

            <Input
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="admin@company.com"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />

            <Input
              label="Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-all"
                  checked={form.rememberMe}
                  onChange={e => setForm({ ...form, rememberMe: e.target.checked })}
                />
              </div>
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-sm text-primary-600 font-semibold hover:text-primary-700 hover:underline">
              Forgot Password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-base shadow-xl shadow-primary-500/20"
            isLoading={loading}
          >
            Sign In to Dashboard
          </Button>

          <p className="text-center text-sm text-gray-500 mt-8">
            New organization?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
              Register Tenant
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
