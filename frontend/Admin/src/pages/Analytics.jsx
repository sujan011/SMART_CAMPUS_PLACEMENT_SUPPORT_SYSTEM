import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { api } from "../services/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function Analytics() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getJobs(),
      api.getDashboard()
    ])
    .then(([jobsRes, dashboardRes]) => {
      const list = jobsRes.data.results || jobsRes.data;
      setJobs(list);
      setStats(dashboardRes.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Failed to load analytics data", err);
      setLoading(false);
    });
  }, []);

  // Dynamic Calculation Logic for Highest Package
  const highestJob = jobs.reduce((max, job) => {
    const currentPkg = parseFloat(job.salary_max) || 0;
    const maxPkg = parseFloat(max.salary_max) || 0;
    return currentPkg > maxPkg ? job : max;
  }, { salary_max: 0, company_name: "N/A", title: "N/A" });

  const highestPackageStr = highestJob.salary_max ? `${(highestJob.salary_max / 100000).toFixed(1)} LPA` : "0 LPA";

  // Calculate Average Package dynamically
  const validJobs = jobs.filter(j => j.salary_max > 0);
  const totalPackage = validJobs.reduce((sum, job) => sum + (job.salary_max || 0), 0);
  const averagePackage = validJobs.length > 0 ? (totalPackage / validJobs.length / 100000).toFixed(1) : 0;

  const placementRate = stats?.placement_rate || 0;

  // Sample data for the reports table
  const recentReports = [
    { id: 1, name: "Placement_Summary_2026.pdf", type: "PDF", date: "09-07-2026", size: "2.4 MB" },
    { id: 2, name: "Company_Wise_Hiring.xlsx", type: "Excel", date: "08-07-2026", size: "1.1 MB" },
    { id: 3, name: "Student_Unplaced_List.xlsx", type: "Excel", date: "05-07-2026", size: "850 KB" },
    { id: 4, name: "Department_Performance_Q2.pdf", type: "PDF", date: "01-07-2026", size: "3.2 MB" },
  ];

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Job Designation,Company,Minimum Salary,Maximum Salary,Deadline\r\n";
    jobs.forEach(job => {
      csvContent += `"${job.title}","${job.company_name || job.company?.name || 'N/A'}",${job.salary_min},${job.salary_max},"${new Date(job.application_deadline).toLocaleDateString()}"\r\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Placement_Summary_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = (report) => {
    if (report.type === 'Excel') {
      handleExportCSV();
    } else {
      let reportText = `Swami Vivekananda Institute of Science & Technology\n`;
      reportText += `Placement Summary Report\n`;
      reportText += `Generated on: ${report.date}\n`;
      reportText += `--------------------------------------------------\n`;
      reportText += `Total Job Openings: ${jobs.length}\n`;
      reportText += `Highest Package: ${highestPackageStr}\n`;
      reportText += `Average Package: ${averagePackage} LPA\n`;
      reportText += `Placement Rate: ${placementRate}%\n\n`;
      reportText += `Job List Details:\n`;
      jobs.forEach((job, idx) => {
        reportText += `${idx+1}. ${job.title} at ${job.company_name || 'N/A'} (Salary: ${job.salary_max} Max)\n`;
      });
      
      const blob = new Blob([reportText], { type: 'text/plain' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = report.name.replace(".pdf", ".txt");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Recharts configurations
  const trendsData = [
    { year: '2023', rate: 72 },
    { year: '2024', rate: 78 },
    { year: '2025', rate: 82 },
    { year: '2026', rate: placementRate || 85 },
  ];

  const departmentData = [
    { name: 'CSE', value: 45, color: '#3b82f6' },
    { name: 'ECE', value: 30, color: '#10b981' },
    { name: 'EEE', value: 15, color: '#f59e0b' },
    { name: 'MECH', value: 10, color: '#ef4444' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f6] font-sans font-normal text-gray-900">
      
      <Sidebar />

      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 max-w-screen-2xl mx-auto w-full flex flex-col gap-6">
          
          {/* Header & Export Actions */}
          <div className="flex justify-between items-center shrink-0">
            <div>
              <h1 className="text-2xl font-normal text-gray-900">Analytics & Reports</h1>
              <p className="text-sm font-normal text-gray-500 mt-1">Generate and download placement statistics.</p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => window.print()} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-normal flex items-center gap-2 transition-colors shadow-sm">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8.267 14.68c-.184 0-.308.018-.372.036v.116c.078.014.21.028.395.028 1.4 0 2.224-1.127 2.224-2.793 0-1.428-.737-2.324-1.841-2.324-.31 0-.584.053-.823.161v4.776zM7.004 16.892h1.66c.21 0 .426-.018.636-.054.498-.08.972-.25 1.411-.504.605-.353 1.144-.889 1.503-1.492.353-.594.536-1.282.536-2.033 0-2.34-1.393-3.692-3.411-3.692-.61 0-1.213.111-1.785.326V16.892zm8.683-7.59h-1.428v2.748h1.428c1.343 0 2.18-.755 2.18-1.854 0-1.077-.818-1.756-2.18-1.756V9.303h-1.428zm-3.049 7.59h1.621v-3.32h1.428c1.884 0 3.328-1.127 3.328-2.917 0-1.801-1.36-2.881-3.328-2.881h-3.049v9.118zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></svg>
                Export to PDF
              </button>
              <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-normal flex items-center gap-2 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path></svg>
                Generate Excel Report
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm font-normal text-gray-500 mb-1">Total Placements</p>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-normal text-gray-900">{loading ? "..." : jobs.length}</h3>
                <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded mb-1">Total Apps</span>
              </div>
            </div>
            
            {/* Dynamically Displayed Highest Package */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm font-normal text-gray-500 mb-1">Highest Package</p>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-normal text-gray-900">{loading ? "..." : highestPackageStr}</h3>
                <span className="text-xs font-normal text-gray-400 mb-1">{loading ? "..." : highestJob.company_name}</span>
              </div>
            </div>

            {/* Dynamically Displayed Average Package */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm font-normal text-gray-500 mb-1">Average Package</p>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-normal text-gray-900">{loading ? "..." : averagePackage} LPA</h3>
                <span className="text-xs font-normal text-gray-400 mb-1">Estimate</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm font-normal text-gray-500 mb-1">Placement Rate</p>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-normal text-gray-900">{loading ? "..." : placementRate}%</h3>
                <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1">Target: 90%</span>
              </div>
            </div>
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[350px] flex flex-col">
              <h3 className="text-base font-normal text-gray-900 mb-6">Placement Trends (YOY)</h3>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis unit="%" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} />
                    <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[350px] flex flex-col">
              <h3 className="text-base font-normal text-gray-900 mb-6">Recruitment by Department</h3>
              <div className="flex-1 min-h-[250px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-semibold text-gray-700">Departments</span>
                  <span className="text-xs text-gray-400">Distribution</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Generated Reports Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0 mb-8">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-base font-normal text-gray-900">Recent Generated Reports</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-6 text-sm font-normal text-gray-500">Report Name</th>
                    <th className="py-3 px-6 text-sm font-normal text-gray-500">Format</th>
                    <th className="py-3 px-6 text-sm font-normal text-gray-500">Generated On</th>
                    <th className="py-3 px-6 text-sm font-normal text-gray-500">Size</th>
                    <th className="py-3 px-6 text-sm font-normal text-gray-500 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-normal text-gray-900 flex items-center gap-3">
                        {report.type === 'PDF' ? (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8.267 14.68c-.184 0-.308.018-.372.036v.116c.078.014.21.028.395.028 1.4 0 2.224-1.127 2.224-2.793 0-1.428-.737-2.324-1.841-2.324-.31 0-.584.053-.823.161v4.776zM7.004 16.892h1.66c.21 0 .426-.018.636-.054.498-.08.972-.25 1.411-.504.605-.353 1.144-.889 1.503-1.492.353-.594.536-1.282.536-2.033 0-2.34-1.393-3.692-3.411-3.692-.61 0-1.213.111-1.785.326V16.892zm8.683-7.59h-1.428v2.748h1.428c1.343 0 2.18-.755 2.18-1.854 0-1.077-.818-1.756-2.18-1.756V9.303h-1.428zm-3.049 7.59h1.621v-3.32h1.428c1.884 0 3.328-1.127 3.328-2.917 0-1.801-1.36-2.881-3.328-2.881h-3.049v9.118zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></svg>
                        ) : (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path></svg>
                        )}
                        {report.name}
                      </td>
                      <td className="py-4 px-6 text-sm font-normal text-gray-600">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-normal ${report.type === 'PDF' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                          {report.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-normal text-gray-600">{report.date}</td>
                      <td className="py-4 px-6 text-sm font-normal text-gray-600">{report.size}</td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => handleDownloadReport(report)} className="text-blue-600 hover:text-blue-800 transition-colors" title="Download">
                          <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}