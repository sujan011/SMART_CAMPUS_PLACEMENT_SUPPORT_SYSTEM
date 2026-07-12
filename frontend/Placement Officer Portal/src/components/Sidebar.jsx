import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Briefcase, 
  GraduationCap, Calendar, FileText, UserCheck, 
  BarChart2, FileBarChart, Bell, MessageSquare, 
  AlertTriangle, Settings, UserCog, User, LogOut, ChevronUp 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const navGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Students', path: '/students', icon: <Users size={18} /> },
        { name: 'Jobs', path: '/jobs', icon: <Briefcase size={18} /> },
        { name: 'Placements', path: '/placements', icon: <GraduationCap size={18} /> },
        { name: 'Applications', path: '/applications', icon: <FileText size={18} /> },
        { name: 'Interviews', path: '/interviews', icon: <UserCheck size={18} /> },
      ]
    },
    {
      title: 'REPORTS & ANALYTICS',
      items: [
        { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={18} /> },
        { name: 'Reports', path: '/reports', icon: <FileBarChart size={18} /> },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Profile', path: '/profile', icon: <User size={18} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] h-screen flex flex-col fixed left-0 top-0 overflow-y-auto custom-scrollbar">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 bg-blue-500 rounded flex items-center justify-center font-bold text-xl shrink-0 text-white shadow-lg shadow-blue-500/20">
          H
        </div>
        <div>
          <h1 className="font-bold text-base text-black leading-tight">Placement Officer Portal</h1>
          <p className="text-xs text-black font-medium mt-0.5">Training & Placement Cell</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-8">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-bold text-black mb-3 px-2 uppercase tracking-wider">{group.title}</h3>
            <ul className="space-y-1.5">
              {group.items.map((item, i) => (
                <li key={i}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-500/30 font-bold' 
                          : 'text-black hover:bg-black/10 font-bold'
                      }`
                    }
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom User Info with Dropdown */}
      <div className="relative mt-auto m-4" ref={dropdownRef}>
        {isDropdownOpen && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden py-2 z-[100] origin-bottom animate-in zoom-in-95 duration-200">
            <Link 
              to="/profile" 
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
            >
              <User size={18} />
              Profile Settings
            </Link>
            <Link 
              to="/settings" 
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
            >
              <Settings size={18} />
              Settings
            </Link>
            <div className="h-px bg-slate-100 my-2 mx-4"></div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-bold"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}

        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full p-3 border border-white/10 flex items-center justify-between transition-colors rounded-xl ${isDropdownOpen ? 'bg-[hsl(var(--sidebar-hover))]' : 'bg-white/5 hover:bg-[hsl(var(--sidebar-hover))]'}`}
        >
          <div className="flex items-center gap-3 overflow-hidden text-left">
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0 border border-white/20">
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[15px] font-bold truncate text-white">{user?.name || 'Placement Officer'}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                Online
              </div>
            </div>
          </div>
          <ChevronUp size={18} className={`text-slate-400 transition-transform duration-300 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
