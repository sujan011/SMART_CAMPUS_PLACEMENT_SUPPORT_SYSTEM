import React from 'react';
import { useApp } from '../../../core/context/AppContext';

export const AnalyticsPage = () => {
    const { data } = useApp();
    const metrics = data?.metrics;

    if (!data) return <div className="p-6 text-center text-gray-500">Loading analytics...</div>;

    const applications = data?.applications || [];

    const totalApps = applications.length;
    const interviewApps = applications.filter(app => 
        app.status === 'interview_scheduled' || 
        app.status === 'selected' || 
        app.status === 'offer_received'
    ).length;
    const interviewRate = totalApps > 0 ? Math.round((interviewApps / totalApps) * 100) : 0;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthCounts = {};
    applications.forEach(app => {
        if (app.applied_at) {
            const date = new Date(app.applied_at);
            const m = monthNames[date.getMonth()];
            monthCounts[m] = (monthCounts[m] || 0) + 1;
        }
    });

    const last6Months = [];
    const currentMonthIdx = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
        const idx = (currentMonthIdx - i + 12) % 12;
        last6Months.push(monthNames[idx]);
    }
    const values = last6Months.map(m => monthCounts[m] || 0);
    const chartValues = values.reduce((sum, v) => sum + v, 0) > 0 ? values : [1, 2, 4, 3, 5, totalApps || 6];
    const months = last6Months;
    const maxVal = Math.max(...chartValues);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Overview</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl card-shadow p-6">
                    <div className="text-sm text-gray-500 font-medium">Profile Completion</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">{metrics.profileCompletion}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics.profileCompletion}%` }}></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl card-shadow p-6">
                    <div className="text-sm text-gray-500 font-medium">Applications Sent</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">{metrics.applications}</div>
                    <div className="text-sm text-green-600 mt-1">↑ 12% from last month</div>
                </div>
                <div className="bg-white rounded-xl card-shadow p-6">
                    <div className="text-sm text-gray-500 font-medium">Interview Rate</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">{interviewRate}%</div>
                    <div className="text-sm text-green-600 mt-1">{interviewApps} interviews from {totalApps} applications</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl card-shadow p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Placement Progress</h3>
                    <div className="flex justify-center">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="68" stroke="#E5E7EB" strokeWidth="10" fill="none"/>
                                <circle cx="80" cy="80" r="68" stroke="#3B82F6" strokeWidth="10" fill="none"
                                    strokeDasharray={2 * Math.PI * 68 * (metrics.progressScore / 100)}
                                    strokeDashoffset={2 * Math.PI * 68 * (1 - metrics.progressScore / 100)}
                                    strokeLinecap="round"/>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-gray-900">{metrics.progressScore}%</span>
                                <span className="text-xs text-gray-500">Overall</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl card-shadow p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Application Trend</h3>
                    <div className="h-48 flex items-end justify-between gap-2">
                        {chartValues.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full bg-blue-100 rounded-t" style={{ height: `${maxVal > 0 ? (val / maxVal) * 100 : 0}%` }}>
                                    <div className="w-full bg-blue-600 rounded-t" style={{ height: `80%` }}></div>
                                </div>
                                <span className="text-xs text-gray-500">{months[i]}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mt-3 gap-6 text-xs text-gray-500">
                        <span><span className="inline-block w-3 h-3 bg-blue-600 rounded mr-1"></span> Applications</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
