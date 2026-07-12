import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

export const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isInterviewExpanded, setIsInterviewExpanded] = useState(location.pathname.startsWith('/interview'));

    useEffect(() => {
        if (location.pathname.startsWith('/interview')) {
            setIsInterviewExpanded(true);
        }
    }, [location.pathname]);

    const mainItems = [
        { id: 'dashboard', path: '/', icon: 'fa-gauge-high', label: 'Dashboard' },
        { id: 'profile', path: '/profile', icon: 'fa-user', label: 'Profile' },
        { id: 'search', path: '/search', icon: 'fa-magnifying-glass', label: 'Search Jobs' },
        { id: 'resume', path: '/resume', icon: 'fa-file-lines', label: 'Resume Builder' },
        { id: 'ats', path: '/ats', icon: 'fa-check-circle', label: 'ATS Checker' },
    ];

    const interviewSubItems = [
        { id: 'overview', path: '/interview/overview', label: 'Overview', icon: 'fa-chevron-right' },
        { id: 'aptitude', path: '/interview/aptitude', label: 'Aptitude', icon: 'fa-chevron-right' },
        { id: 'technical', path: '/interview/technical', label: 'Technical', icon: 'fa-chevron-right' },
        { id: 'coding', path: '/interview/coding', label: 'Coding Practice', icon: 'fa-chevron-right' },
        { id: 'hr', path: '/interview/hr', label: 'HR Questions', icon: 'fa-chevron-right' },
    ];

    const bottomItems = [
        { id: 'helpdesk', path: '/helpdesk', icon: 'fa-robot', label: 'AI Helpdesk' },
        { id: 'settings', path: '/settings', icon: 'fa-gear', label: 'Settings' },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto flex-shrink-0 custom-scrollbar flex flex-col">
            <div className="p-4 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">SC</div>
                    <div>
                        <div className="font-bold text-gray-900 text-sm leading-tight">SMART CAMPUS</div>
                        <div className="text-[10px] text-gray-500 tracking-wide">PLACEMENT SUPPORT</div>
                    </div>
                </div>
            </div>
            <nav className="p-3 space-y-1 flex-1">
                {mainItems.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => 
                            `sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 ${isActive && item.path !== '/' ? 'bg-blue-50 text-blue-700' : ''} ${isActive && item.path === '/' && location.pathname === '/' ? 'bg-blue-50 text-blue-700' : ''}`
                        }
                    >
                        <i className={`fa-solid ${item.icon} w-4 text-center text-sm`}></i>
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                <div>
                    <button 
                        onClick={() => {
                            setIsInterviewExpanded(!isInterviewExpanded);
                            if (!location.pathname.startsWith('/interview')) {
                                navigate('/interview/overview');
                            }
                        }}
                        className={`w-full sidebar-item flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isInterviewExpanded ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-people-group w-4 text-center text-sm"></i>
                            <span>Interview Preparation</span>
                        </div>
                        <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isInterviewExpanded ? 'rotate-180' : ''}`}></i>
                    </button>

                    {isInterviewExpanded && (
                        <div className="mt-1 ml-2 pl-4 border-l-2 border-gray-100 space-y-1">
                            {interviewSubItems.map(sub => (
                                <NavLink
                                    key={sub.id}
                                    to={sub.path}
                                    className={({ isActive }) => 
                                        `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`
                                    }
                                >
                                    <i className={`fa-solid ${sub.icon} text-[10px]`}></i>
                                    <span>{sub.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>

                {bottomItems.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => 
                            `sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 ${isActive ? 'bg-blue-50 text-blue-700' : ''}`
                        }
                    >
                        <i className={`fa-solid ${item.icon} w-4 text-center text-sm`}></i>
                        <span>{item.label}</span>
                        {item.id === 'helpdesk' && (
                            <span className="ml-auto bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">AI</span>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};
