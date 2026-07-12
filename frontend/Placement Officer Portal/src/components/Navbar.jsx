import React from 'react';
import { Search, Bell, Mail, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Simple logic to format page title based on path
  const pathName = location.pathname.substring(1);
  const title = pathName ? pathName.charAt(0).toUpperCase() + pathName.slice(1) : 'Dashboard';

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="text-slate-500 hover:text-slate-700 md:hidden">
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">Welcome back, {user?.name?.split(' ')[0] || 'Officer'}!</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search students, companies..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-72 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              12
            </span>
          </button>
          <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
            <Mail size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              7
            </span>
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200"></div>

        <Link to="/profile" className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer">
          <img 
            src={localStorage.getItem('profilePic') || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} 
            alt="Profile" 
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-700">{user?.name || 'Placement Officer'}</p>
            <p className="text-xs text-slate-500">PO1234</p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
