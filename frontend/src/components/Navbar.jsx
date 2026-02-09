import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, LayoutDashboard, Folder, ListChecks,
  Users, Globe, LogOut, User, Settings, ChevronDown
} from 'lucide-react';
import { Button } from './ui/Button';

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

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">
                S
              </div>
              <h1 className="text-xl font-display font-bold text-gray-900 tracking-tight">SAAS.<span className="text-primary-600">CORE</span></h1>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.filter(l => l.show).map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive(link.path)
                      ? "bg-primary-50 text-primary-700 shadow-sm"
                      : "text-gray-600 hover:bg-white/50 hover:text-gray-900"}
                  `}
                >
                  <link.icon size={18} className={isActive(link.path) ? "text-primary-600" : "text-gray-400"} />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:relative md:block">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 pl-1 pr-3 py-1 hover:bg-white/50 rounded-full border border-transparent hover:border-gray-200 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-700 leading-none">{user?.fullName}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className="inline-flex mt-2 items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 capitalize">
                        {user?.role?.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={16} className="text-gray-400" /> Profile
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings size={16} className="text-gray-400" /> Settings
                      </Link>
                    </div>

                    <div className="py-1 border-t border-gray-50">
                      <button onClick={logout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 space-y-1 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.filter(l => l.show).map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center gap-3 p-3 rounded-xl text-base font-medium transition-all
                ${isActive(link.path) ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"}
              `}
            >
              <link.icon size={20} className={isActive(link.path) ? "text-primary-600" : "text-gray-400"} />
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-100 my-2 pt-2">
            <div className="px-3 py-2 flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50">
              <LogOut size={20} /> Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
