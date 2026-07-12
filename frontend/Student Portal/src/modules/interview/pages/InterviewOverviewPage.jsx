import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../core/services/api';

export const InterviewOverviewPage = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getPrepDashboard()
            .then(res => {
                setDashboardData(res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load prep dashboard data", err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const categories = dashboardData?.categories || [];
    const getProgress = (slug) => {
        const cat = categories.find(c => c.slug === slug);
        return cat ? cat.progress_percent : 0;
    };

    const overallProgress = dashboardData?.overall_progress_percent || 0;
    const stats = dashboardData?.stats || { topics_completed: 0, topics_total: 0, mock_interviews_done: 0, problems_solved: 0 };
    const streak = dashboardData?.streak || { current_streak: 0 };
    const skillsToFocus = dashboardData?.top_skills_to_focus || [];

    return (
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Interview Preparation</h1>
                    <p className="text-gray-500">Prepare smart and crack your dream job</p>
                </div>
                {streak.current_streak > 0 && (
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl text-orange-700 font-bold shadow-sm animate-pulse">
                        <i className="fa-solid fa-fire text-lg"></i>
                        <span>{streak.current_streak} Day Streak!</span>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard onClick={() => navigate('/interview/aptitude')} icon="fa-brain" color="text-green-500" bg="bg-green-100" title="Aptitude" subtitle="Quant, Reasoning, Verbal Ability" stat="120+ Topics" progress={getProgress('aptitude')} />
                    <StatCard onClick={() => navigate('/interview/technical')} icon="fa-file-code" color="text-blue-500" bg="bg-blue-100" title="Technical" subtitle="DSA, OOPs, DBMS, OS, CN, SQL" stat="95+ Topics" progress={getProgress('technical')} />
                    <StatCard onClick={() => navigate('/interview/coding')} icon="fa-code" color="text-purple-500" bg="bg-purple-100" title="Coding Practice" subtitle="Practice problems from easy to hard" stat="450+ Problems" progress={getProgress('coding')} />
                    <StatCard onClick={() => navigate('/interview/hr')} icon="fa-comments" color="text-yellow-500" bg="bg-yellow-100" title="HR Questions" subtitle="Common HR questions & answers" stat="250+ Questions" progress={getProgress('hr')} />
                </div>

                {/* Main Content Area - Progress Row */}
                <div className="w-full">
                    {/* Big Progress Section */}
                    <div className="w-full bg-white rounded-xl border border-gray-200 p-8 card-shadow flex flex-col md:flex-row items-center gap-8">
                        {/* SVG Pie Chart */}
                        <div className="relative w-48 h-48 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                {/* Background circle */}
                                <circle cx="96" cy="96" r="80" stroke="#F3F4F6" strokeWidth="24" fill="none" />
                                {/* Progress circle */}
                                <circle 
                                    cx="96" cy="96" r="80" 
                                    stroke="#2563EB" strokeWidth="24" fill="none"
                                    strokeDasharray={2 * Math.PI * 80}
                                    strokeDashoffset={2 * Math.PI * 80 * (1 - overallProgress / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-gray-900">{overallProgress}%</span>
                                <span className="text-sm text-gray-500 font-medium">Completed</span>
                            </div>
                        </div>

                        {/* Detailed Stats */}
                        <div className="flex-1 w-full">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Progress</h3>
                            <p className="text-gray-500 mb-6">You are doing great! Keep up the consistency.</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="text-gray-500 text-sm mb-1">Topics Completed</div>
                                    <div className="text-xl font-bold text-gray-900">{stats.topics_completed} <span className="text-sm text-gray-400 font-normal">/ {stats.topics_total || 0}</span></div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="text-gray-500 text-sm mb-1">Mock Interviews Done</div>
                                    <div className="text-xl font-bold text-gray-900">{stats.mock_interviews_done}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="text-gray-500 text-sm mb-1">Streak Record</div>
                                    <div className="text-xl font-bold text-gray-900">{streak.current_streak} days</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="text-gray-500 text-sm mb-1">Problems Solved</div>
                                    <div className="text-xl font-bold text-gray-900">{stats.problems_solved}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vertical Stack: Choose Your Preparation Path & Top Skills Row */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-6 card-shadow">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Your Preparation Path</h2>
                        <div className="space-y-4">
                            <PathItem 
                                icon="fa-bullseye" color="text-green-500" bg="bg-green-100" 
                                title="Aptitude Preparation" 
                                desc="Improve your aptitude skills with topic-wise practice tests." 
                                btnText="Start Practicing" btnColor="bg-green-500 hover:bg-green-600"
                                onClick={() => navigate('/interview/aptitude')}
                            />
                            <PathItem 
                                icon="fa-laptop-code" color="text-blue-500" bg="bg-blue-100" 
                                title="Technical Preparation" 
                                desc="Strengthen your technical concepts and fundamentals." 
                                btnText="Start Learning" btnColor="bg-blue-600 hover:bg-blue-700"
                                onClick={() => navigate('/interview/technical')}
                            />
                            <PathItem 
                                icon="fa-code" color="text-purple-500" bg="bg-purple-100" 
                                title="Coding Practice" 
                                desc="Solve coding problems and improve problem solving." 
                                btnText="Solve Problems" btnColor="bg-purple-600 hover:bg-purple-700"
                                onClick={() => navigate('/interview/coding')}
                            />
                            <PathItem 
                                icon="fa-file-signature" color="text-pink-500" bg="bg-pink-100" 
                                title="Mock Tests" 
                                desc="Take mock tests and get AI feedback to improve." 
                                btnText="Start Mock Test" btnColor="bg-pink-500 hover:bg-pink-600"
                                onClick={() => navigate('/interview/mock-test')}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 card-shadow">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Skills to Focus</h2>
                        <div className="space-y-4">
                            {skillsToFocus.length > 0 ? (
                                skillsToFocus.map((s, idx) => (
                                    <SkillCard 
                                        key={idx} 
                                        title={s.name} 
                                        desc={s.description} 
                                        priority={s.importance.toUpperCase()} 
                                        pColor={s.importance === 'high' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'} 
                                        icon="fa-award" 
                                    />
                                ))
                            ) : (
                                <>
                                    <SkillCard title="DSA" desc="Important for coding rounds" priority="HIGH" pColor="text-green-600 bg-green-50" icon="fa-file-code" />
                                    <SkillCard title="System Design" desc="Frequently asked in SDE roles" priority="HIGH" pColor="text-green-600 bg-green-50" icon="fa-sitemap" />
                                    <SkillCard title="DBMS" desc="Important for technical rounds" priority="MEDIUM" pColor="text-yellow-600 bg-yellow-50" icon="fa-database" />
                                    <SkillCard title="Operating System" desc="Scoring topic in interviews" priority="MEDIUM" pColor="text-yellow-600 bg-yellow-50" icon="fa-microchip" />
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

/* Sub-components for cleaner code */
const StatCard = ({ icon, color, bg, title, subtitle, stat, progress, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-5 rounded-xl border border-gray-200 card-shadow flex flex-col cursor-pointer hover:border-blue-200 hover:shadow-md transition text-left"
    >
        <div className="flex justify-between items-start mb-3">
            <div className={`w-10 h-10 ${bg} ${color} rounded-lg flex items-center justify-center text-lg`}>
                <i className={`fa-solid ${icon}`}></i>
            </div>
        </div>
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        <p className="text-[10px] text-gray-500 mb-4 min-h-[30px]">{subtitle}</p>
        <div className="mt-auto">
            <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-gray-900">{stat}</span>
                <span className="text-xs text-gray-500">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full bg-blue-500`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    </div>
);

const PathItem = ({ icon, color, bg, title, desc, btnText, btnColor, onClick }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 transition-colors gap-4">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${bg} ${color} rounded-full flex items-center justify-center text-xl shrink-0`}>
                <i className={`fa-solid ${icon}`}></i>
            </div>
            <div>
                <h3 className="font-bold text-gray-900 text-[15px]">{title}</h3>
                <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
            </div>
        </div>
        <button onClick={onClick} className={`${btnColor} text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition shrink-0 w-full sm:w-auto`}>
            {btnText}
        </button>
    </div>
);

const SkillCard = ({ title, desc, priority, pColor, icon }) => (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition">
        <div className="w-10 h-10 bg-white text-blue-600 rounded shadow-sm flex items-center justify-center shrink-0">
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${pColor}`}>{priority}</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-tight">{desc}</p>
        </div>
    </div>
);
