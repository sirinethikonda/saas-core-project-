import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, LayoutDashboard, Folder, ListChecks, 
  Users, Globe, LogOut, User, Settings, ChevronDown 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Projects', path: '/projects', icon: Folder, show: true },
    { 
      name: 'Tasks', 
      path: '/tasks', 
      icon: ListChecks, 
      show: ['tenant_admin', 'super_admin'].includes(user?.role) 
    },
    { 
      name: 'Users', 
      path: '/users', 
      icon: Users, 
      show: user?.role === 'tenant_admin' 
    },
    { 
      name: 'Tenants', 
      path: '/tenants', 
      icon: Globe, 
      show: user?.role === 'super_admin' 
    },
  ];

  const activeClass = (path) => 
    location.pathname === path ? "text-primary bg-blue-50" : "text-gray-600 hover:bg-gray-50";

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-primary tracking-tighter">SAAS.CORE</h1>
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.filter(l => l.show).map(link => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${activeClass(link.path)}`}
                >
                  <link.icon size={18} /> {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:relative md:block">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold uppercase">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-gray-800 leading-none">{user?.fullName}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-150 z-20">
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"><User size={16}/> Profile</Link>
                    <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"><Settings size={16}/> Settings</Link>
                    <hr className="my-1 border-gray-50" />
                    <button onClick={logout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-bold">
                      <LogOut size={16}/> Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-50 p-4 space-y-1">
          {navLinks.filter(l => l.show).map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-xl text-base font-bold ${activeClass(link.path)}`}
            >
              <link.icon size={20} /> {link.name}
            </Link>
          ))}
          <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-xl text-base font-bold text-red-500 hover:bg-red-50">
            <LogOut size={20}/> Logout
          </button>
        </div>
      )}
    </nav>
  );
}