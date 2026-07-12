import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const TopNav = () => {
    const { data, currentUser, logout } = useApp();
    const [showDropdown, setShowDropdown] = useState(false);
    
    const notifications = data?.notifications || [];
    const unreadCount = notifications.filter(n => !n.read).length;
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">SC</div>
                    <div className="hidden sm:block">
                        <div className="font-bold text-gray-900 text-sm leading-tight">SMART CAMPUS</div>
                        <div className="text-[10px] text-gray-500 tracking-wide">PLACEMENT SUPPORT</div>
                    </div>
                </div>
                <div className="flex-1 max-w-2xl mx-4">
                    <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input
                            type="text"
                            placeholder="Search jobs, companies, skills..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    navigate(e.target.value ? `/search?q=${encodeURIComponent(e.target.value)}` : '/search');
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Link to="/notifications" className="relative cursor-pointer group">
                    <i className="fa-regular fa-bell text-gray-600 text-lg group-hover:text-blue-600 transition-colors"></i>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{unreadCount}</span>
                    )}
                </Link>
                <Link to="/helpdesk" className="relative cursor-pointer group">
                    <i className="fa-regular fa-comment text-gray-600 text-lg group-hover:text-blue-600 transition-colors"></i>
                </Link>
                <div className="relative">
                    <div onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 cursor-pointer pl-3 border-l border-gray-200">
                        <img
                            src={currentUser?.avatar || "https://ui-avatars.com/api/?name=User"}
                            alt="User"
                            className="w-8 h-8 rounded-full"
                        />

                        <div className="hidden sm:block text-left">
                            <div className="text-sm font-medium text-gray-900">
                                {currentUser?.username || currentUser?.email || "Student"}
                            </div>

                            <div className="text-xs text-gray-500">
                                {currentUser?.role || "Student"}
                            </div>
                        </div>
                        <i className="fa-solid fa-chevron-down text-gray-400 text-xs"></i>
                    </div>
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <div className="text-sm font-medium text-gray-900">{data.user.name}</div>
                                <div className="text-xs text-gray-500">{data.user.department}</div>
                            </div>
                            <Link to="/profile" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"><i className="fa-regular fa-user mr-2"></i> Profile</Link>
                            <Link to="/settings" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"><i className="fa-regular fa-gear mr-2"></i> Settings</Link>
                            <div onClick={handleLogout} className="px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer border-t border-gray-100"><i className="fa-regular fa-right-from-bracket mr-2"></i> Logout</div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
