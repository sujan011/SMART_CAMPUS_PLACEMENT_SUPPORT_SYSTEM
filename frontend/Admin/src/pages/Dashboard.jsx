import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { api } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getDashboard(),
      api.getStudents()
    ])
    .then(([dashboardRes, studentsRes]) => {
      setStats(dashboardRes.data);
      const studentList = studentsRes.data?.results || studentsRes.data || [];
      setStudents(studentList);
      setLoading(false);
    })
    .catch(err => {
      console.error("Failed to load admin dashboard data", err);
      setLoading(false);
    });
  }, []);

  const dbInterviews = stats?.recent_applications
    ? stats.recent_applications.map(app => ({
        id: app.id,
        student: app.student?.full_name || "Student",
        company: app.job?.company_name || app.job?.company?.name || "Company",
        role: app.job?.title || "SDE",
        date: new Date(app.applied_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        status: app.status.replace('_', ' ').toUpperCase(),
        statusColor: app.status === 'selected' || app.status === 'offer_received'
                     ? 'bg-green-100 text-green-700'
                     : app.status === 'rejected'
                     ? 'bg-red-100 text-red-700'
                     : 'bg-blue-100 text-blue-700'
      }))
    : [];

  const upcomingInterviews = dbInterviews.length > 0 ? dbInterviews : [
    { id: 1, student: "Suresh K.", company: "TCS", role: "SDE", date: "12 July", status: "Scheduled", statusColor: "bg-green-100 text-green-700" },
    { id: 2, student: "Pooja D.", company: "Deloitte", role: "Consultant", date: "13 July", status: "Pending", statusColor: "bg-yellow-100 text-yellow-700" },
    { id: 3, student: "Ankit S.", company: "HCL", role: "Eng", date: "14 July", status: "Scheduled", statusColor: "bg-blue-100 text-blue-700" },
  ];

  const branchStats = {};
  students.forEach(st => {
    const branch = st.branch || "General";
    if (!branchStats[branch]) {
      branchStats[branch] = { total: 0, verified: 0 };
    }
    branchStats[branch].total += 1;
    if (st.is_verified) {
      branchStats[branch].verified += 1;
    }
  });

  const dbDepartments = Object.keys(branchStats).map((branch, i) => {
    const total = branchStats[branch].total;
    const verified = branchStats[branch].verified;
    const rate = total > 0 ? Math.round((verified / total) * 100) : 0;
    return {
      id: i,
      dept: branch.toUpperCase(),
      width: `${rate}%`,
      value: `${rate}%`
    };
  });

  const topDepartments = dbDepartments.length > 0 ? dbDepartments : [
    { id: 1, dept: "CSE", width: "88%", value: "88%" },
    { id: 2, dept: "ECE", width: "82%", value: "82%" },
    { id: 3, dept: "ME", width: "75%", value: "75%" },
    { id: 4, dept: "MBA", width: "71%", value: "71%" },
  ];

  return (
    <div className="flex font-sans">
      <Sidebar />
      <div className="ml-64 flex-1 bg-[#f0f4f8] min-h-screen">
        <Navbar />

        <div className="p-6 max-w-[1400px] mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-2xl font-normal text-gray-900 flex items-center gap-2">
                Welcome Admin <span className="text-xl">👋</span>
              </h1>
              <p className="text-gray-500 mt-1 text-sm font-normal">
                Smart Campus Placement System Dashboard
              </p>
            </div>
            {/* Header Illustration Placeholder */}
            <div className="w-24 h-12 bg-blue-50/50 rounded flex items-center justify-center opacity-70">
              <span className="text-xs text-blue-300 font-normal">Graphic</span>
            </div>
          </div>

          {/* KPI Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Students */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path></svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-normal">Total Students</h3>
              <div className="flex items-end gap-3 mt-1">
                <p className="text-3xl font-normal text-gray-900">{loading ? "..." : stats?.total_students || 0}</p>
              </div>
            </div>

            {/* Card 2: Placed Students */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-normal">Placed Students</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-normal text-gray-900">{loading ? "..." : stats?.selected_students || 0}</p>
                <span className="text-sm font-normal text-gray-400">({loading ? "..." : stats?.placement_rate || 0}%)</span>
              </div>
            </div>

            {/* Card 3: Total Companies */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"></path></svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-normal">Total Companies</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-normal text-gray-900">{loading ? "..." : stats?.total_companies || 0}</p>
              </div>
            </div>

            {/* Card 4: Current Job Openings */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path></svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-normal">Current Job Openings</h3>
              <div className="flex items-end justify-between mt-1">
                <p className="text-3xl font-normal text-gray-900">{loading ? "..." : stats?.active_jobs || 0}</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
              <h2 className="text-base font-normal text-gray-900 mb-6">Placement Trend (AY 2026-27)</h2>
              <div className="h-64 bg-gradient-to-b from-blue-50/20 to-transparent flex items-end justify-between px-2 pb-6 border-b border-l border-gray-100 relative">
                 {/* Decorative Line Chart Placeholder */}
                 <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                    <path d="M0,150 C50,50 100,200 150,150 C200,100 250,50 300,120 C350,190 400,80 450,100 C500,120 550,200 600,160 L600,250 L0,250 Z" fill="rgba(59, 130, 246, 0.05)" />
                    <path d="M0,150 C50,50 100,200 150,150 C200,100 250,50 300,120 C350,190 400,80 450,100 C500,120 550,200 600,160" fill="none" stroke="#3b82f6" strokeWidth="2" />
                 </svg>
                 <div className="w-full flex justify-between text-xs text-gray-400 font-normal z-10 absolute bottom-1 px-4">
                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
                 </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-base font-normal text-gray-900 mb-6">Placement Sector Distribution</h2>
              <div className="flex flex-col items-center justify-center h-64 relative">
                {/* Decorative Pie Chart Placeholder */}
                <div className="w-40 h-40 rounded-full bg-blue-100 relative overflow-hidden border-4 border-white shadow">
                  <div className="absolute inset-0 bg-[#407899] w-full h-full" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 50% 100%)' }}></div>
                  <div className="absolute inset-0 bg-[#59b87c] w-full h-full" style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0 100%, 0 50%)' }}></div>
                  <div className="absolute inset-0 bg-[#65b2be] w-full h-full" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0)' }}></div>
                  <div className="absolute inset-0 bg-[#9fb381] w-full h-full" style={{ clipPath: 'polygon(50% 50%, 0 0, 50% 0)' }}></div>
                  <div className="absolute inset-0 bg-[#7c829e] w-full h-full" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0)' }}></div>
                </div>
                {/* Legend */}
                <div className="mt-6 flex flex-col gap-2 w-full pl-8">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#407899] rounded-sm"></span><span className="text-xs font-normal text-gray-700">IT/Tech</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#59b87c] rounded-sm"></span><span className="text-xs font-normal text-gray-700">Consulting</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#65b2be] rounded-sm"></span><span className="text-xs font-normal text-gray-700">FinTech</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#9fb381] rounded-sm"></span><span className="text-xs font-normal text-gray-700">Manufacturing</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#7c829e] rounded-sm"></span><span className="text-xs font-normal text-gray-700">Others</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            
            {/* Upcoming Campus Interviews */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-base font-normal text-gray-900 mb-4">Upcoming Campus Interviews</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="py-3 px-2 text-xs font-normal text-gray-600 border-b border-gray-100">Student</th>
                      <th className="py-3 px-2 text-xs font-normal text-gray-600 border-b border-gray-100">Company</th>
                      <th className="py-3 px-2 text-xs font-normal text-gray-600 border-b border-gray-100">Role</th>
                      <th className="py-3 px-2 text-xs font-normal text-gray-600 border-b border-gray-100">Interview Date</th>
                      <th className="py-3 px-2 text-xs font-normal text-gray-600 border-b border-gray-100">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingInterviews.map((interview) => (
                      <tr key={interview.id} className="hover:bg-gray-50/30">
                        <td className="py-3 px-2 text-sm font-normal text-gray-800 border-b border-gray-50">{interview.student}</td>
                        <td className="py-3 px-2 text-sm font-normal text-gray-700 border-b border-gray-50">{interview.company}</td>
                        <td className="py-3 px-2 text-sm font-normal text-gray-700 border-b border-gray-50">{interview.role}</td>
                        <td className="py-3 px-2 text-sm font-normal text-gray-700 border-b border-gray-50">{interview.date}</td>
                        <td className="py-3 px-2 border-b border-gray-50">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-normal ${interview.statusColor}`}>
                            {interview.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Hiring Departments */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-base font-normal text-gray-900 mb-4">Top Hiring Departments</h2>
              <div className="space-y-5 mt-4">
                {topDepartments.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <span className="w-10 text-sm font-normal text-gray-700">{item.dept}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: item.width }}
                      ></div>
                    </div>
                    <span className="w-10 text-right text-sm font-normal text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}