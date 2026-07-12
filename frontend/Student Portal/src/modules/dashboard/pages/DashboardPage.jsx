import React from 'react';
import { useApp } from '../../../core/context/AppContext';

export const DashboardPage = () => {
    const { data, isLoading, error } = useApp();
    
    if (isLoading) return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;
    if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;
    if (!data) return null;

    const { user, metrics, recommendedJobs, applications, upcomingInterviews } = data;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Welcome */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}! </h1>
                <p className="text-gray-500">Let's get you placed in your dream company.</p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 card-shadow card-hover">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm text-gray-500 font-medium">Profile Completion</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.profileCompletion}%</div>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><i className="fa-regular fa-user"></i></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics.profileCompletion}%` }}></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 card-shadow card-hover">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm text-gray-500 font-medium">Placement Readiness</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.placementReadiness}</div>
                        </div>
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600"><i className="fa-regular fa-circle-check"></i></div>
                    </div>
                    <div className="mt-3">
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Good</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 card-shadow card-hover">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm text-gray-500 font-medium">Applications</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.applications}</div>
                        </div>
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600"><i className="fa-regular fa-file-pen"></i></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">{metrics.inProgress} in progress</div>
                </div>
                <div className="bg-white rounded-xl p-5 card-shadow card-hover">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm text-gray-500 font-medium">Upcoming Interviews</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.upcomingInterviews}</div>
                        </div>
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600"><i className="fa-regular fa-calendar"></i></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Next: {metrics.nextInterview}</div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recommended Jobs */}
                    <div className="bg-white rounded-xl card-shadow overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Recommended Jobs for You</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recommendedJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="px-5 py-3 hover:bg-gray-50 transition flex items-center justify-between"
                                >
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            {job.title}
                                        </h4>

                                        <p className="text-sm text-gray-500">
                                            {job.location}
                                        </p>

                                        <p className="text-xs text-gray-400">
                                            {job.job_type.replace("_", " ")}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-semibold">
                                            ₹{Number(job.salary_min).toLocaleString()} -
                                            ₹{Number(job.salary_max).toLocaleString()}
                                        </div>

                                        <div className="text-xs text-green-600">
                                            {job.match_percent ?? 0}% Match
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Applications Table */}
                    <div className="bg-white rounded-xl card-shadow overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Total Job Applied</h3>
                            <span className="text-xs text-gray-500">Last 30 days</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-medium">Company</th>
                                        <th className="px-5 py-3 text-left font-medium">Position</th>
                                        <th className="px-5 py-3 text-left font-medium">Status</th>
                                        <th className="px-5 py-3 text-left font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {applications.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center py-10 text-gray-500"
                                            >
                                                You haven't applied for any jobs yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        applications.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-medium">
                                                    {app.job?.company_name}
                                                </td>

                                                <td className="px-5 py-3">
                                                    {app.job?.title}
                                                </td>

                                                <td className="px-5 py-3">
                                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                        {app.status}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-3">
                                                    {new Date(app.applied_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Placement Progress */}
                    <div className="bg-white rounded-xl card-shadow p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Placement Progress</h3>
                        <div className="flex flex-col items-center">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="8" fill="none"/>
                                    <circle cx="64" cy="64" r="56" stroke="#3B82F6" strokeWidth="8" fill="none"
                                        strokeDasharray={2 * Math.PI * 56 * (metrics.progressScore / 100)}
                                        strokeDashoffset={2 * Math.PI * 56 * (1 - metrics.progressScore / 100)}
                                        strokeLinecap="round"/>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-900">{metrics.progressScore}%</span>
                                </div>
                            </div>
                            <div className="w-full mt-4 space-y-2">
                                {['Profile Setup', 'Resume Upload', 'Skills Assessment', 'Mock Interview'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                        <i className={`fa-regular ${i < 3 ? 'fa-circle-check text-green-500' : 'fa-circle text-gray-300'}`}></i>
                                        <span className={i < 3 ? 'text-gray-700' : 'text-gray-400'}>{item}</span>
                                        {i < 3 && <span className="ml-auto text-xs text-green-600">✓</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Interviews */}
                    <div className="bg-white rounded-xl card-shadow p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
                        <div className="space-y-3">
                            {upcomingInterviews.map((interview, i) => (
                                <div key={i} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm">{interview.company[0]}</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 text-sm">{interview.company}</div>
                                        <div className="text-xs text-gray-500">{interview.role} • {interview.time}</div>
                                    </div>
                                    <span className="text-xs text-gray-400">{interview.location}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
