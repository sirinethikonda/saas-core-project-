import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

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
      // API Integration: Requirement 4.1.1
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary">SaaS Platform</h1>
          <p className="text-gray-500 mt-2">Create your organization account</p>
        </div>

        {success ? (
          <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h2 className="text-xl font-bold text-green-800">Success!</h2>
            <p className="text-green-600">Tenant registered. Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-danger text-sm font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-1">Organization Name</label>
              <input 
                type="text" required className="w-full p-3 bg-gray-50 border rounded-xl outline-primary"
                onChange={e => setForm({...form, tenantName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-1">Subdomain</label>
              <div className="flex">
                <input 
                  type="text" required className="w-full p-3 bg-gray-50 border-y border-l rounded-l-xl outline-none"
                  onChange={e => setForm({...form, subdomain: e.target.value})}
                />
                <span className="p-3 bg-gray-100 border rounded-r-xl text-gray-400">.yourapp.com</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic">Preview: {form.subdomain || 'subdomain'}.yourapp.com</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-1">Admin Name</label>
                <input 
                  type="text" required className="w-full p-3 bg-gray-50 border rounded-xl outline-primary"
                  onChange={e => setForm({...form, adminFullName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-1">Admin Email</label>
                <input 
                  type="email" required className="w-full p-3 bg-gray-50 border rounded-xl outline-primary"
                  onChange={e => setForm({...form, adminEmail: e.target.value})}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-black uppercase text-gray-400 mb-1">Password</label>
              <input 
                type={showPassword ? "text" : "password"} required 
                className="w-full p-3 bg-gray-50 border rounded-xl outline-primary"
                onChange={e => setForm({...form, adminPassword: e.target.value})}
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400"
              >
                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-1">Confirm Password</label>
              <input 
                type="password" required className="w-full p-3 bg-gray-50 border rounded-xl outline-primary"
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" className="w-4 h-4" 
                onChange={e => setForm({...form, agreeTerms: e.target.checked})}
              />
              <span className="text-xs text-gray-500">I agree to Terms & Conditions</span>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-primary text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 transition"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Register Organization"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account? <Link to="/login" className="text-primary font-bold">Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}