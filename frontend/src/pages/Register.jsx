import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle, Smartphone, Mail, User, Lock, Building2 } from 'lucide-react';
import apiClient from '../api/apiClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    tenantName: '',
    subdomain: '',
    adminEmail: '',
    adminFullName: '',
    adminPassword: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side Validation
    if (form.adminPassword !== form.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (!form.agreeTerms) {
      return setError("You must agree to the terms");
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/register-tenant', {
        tenantName: form.tenantName,
        subdomain: form.subdomain,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        adminFullName: form.adminFullName
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try a different subdomain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 text-white font-bold text-xl shadow-lg shadow-primary-500/30 mb-4">
            S
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
            Start your journey
          </h1>
          <p className="text-gray-500 mt-2">
            Create your organization workspace in seconds
          </p>
        </div>

        <Card className="shadow-2xl shadow-primary-900/10 border-white/50 backdrop-blur-sm">
          {success ? (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-500 mb-6">Your organization has been created. Redirecting you to login...</p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-green-500 animate-[progress_3s_ease-in-out_forwards]" style={{ width: '0%' }} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Organization Name"
                  icon={Building2}
                  placeholder="Acme Inc."
                  value={form.tenantName}
                  onChange={e => setForm({ ...form, tenantName: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
                    Workspace URL
                  </label>
                  <div className="flex rounded-xl shadow-sm ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-primary-500 transition-all bg-white overflow-hidden">
                    <input
                      type="text"
                      required
                      className="flex-1 border-0 bg-transparent py-2.5 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="subdomain"
                      value={form.subdomain}
                      onChange={e => setForm({ ...form, subdomain: e.target.value })}
                    />
                    <div className="flex select-none items-center pr-4 bg-gray-50 border-l border-gray-100 px-3 text-gray-500 sm:text-sm font-medium">
                      .saas-core.com
                    </div>
                  </div>
                  <p className="mt-1.5 ml-1 text-[10px] text-gray-400 font-medium">
                    This will be your unique project URL
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Admin Name"
                    icon={User}
                    placeholder="John Doe"
                    value={form.adminFullName}
                    onChange={e => setForm({ ...form, adminFullName: e.target.value })}
                    required
                  />
                  <Input
                    label="Work Email"
                    icon={Mail}
                    type="email"
                    placeholder="john@acme.com"
                    value={form.adminEmail}
                    onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label="Password"
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.adminPassword}
                      onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <Input
                    label="Confirm"
                    icon={Lock}
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <div className="flex h-6 items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={e => setForm({ ...form, agreeTerms: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 transition-colors cursor-pointer"
                  />
                </div>
                <div className="text-sm leading-6">
                  <label htmlFor="terms" className="font-medium text-gray-700 cursor-pointer">
                    I agree to the <a href="#" className="font-semibold text-primary-600 hover:text-primary-500">Terms of Service</a> and <a href="#" className="font-semibold text-primary-600 hover:text-primary-500">Privacy Policy</a>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-base shadow-xl shadow-primary-500/20"
                isLoading={loading}
              >
                Create Workspace
              </Button>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}