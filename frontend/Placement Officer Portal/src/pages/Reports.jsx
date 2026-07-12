import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, FileText, Download, Clock, Search, ChevronDown, 
  Check, Filter, ArrowRight, FileBarChart, Users, Building2, Briefcase, 
  MoreVertical, Eye, FilePieChart, BarChart2, Activity, ShieldAlert 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { api } from '../services/api';

const ReportsAnalyticsDashboard = () => {
  // Data States
  const [reportsData, setReportsData] = useState([]);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Download Helper
  const handleDownloadReport = async (reportName, reportType) => {
    try {
      if (reportType === 'Student') {
        const res = await api.getStudents();
        const list = res.data.results || res.data || [];
        const headers = "Name,Email,Enrollment No,Branch,CGPA,Verified\n";
        const rows = list.map(s => `"${s.full_name || ''}","${s.email}","${s.enrollment_no || ''}","${s.branch || ''}",${s.cgpa || 0},${s.is_verified}`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        triggerDownload(blob, reportName.replace(".xlsx", ".csv").replace(".pdf", ".csv"));
      } else if (reportType === 'Company') {
        const res = await api.getCompanies();
        const list = res.data.results || res.data || [];
        const headers = "Company Name,Industry,Website,Location\n";
        const rows = list.map(c => `"${c.name}","${c.industry || ''}","${c.website || ''}","${c.location || ''}"`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        triggerDownload(blob, reportName.replace(".xlsx", ".csv").replace(".pdf", ".csv"));
      } else {
        const res = await api.getDashboard();
        const d = res.data || {};
        const content = `Placement Summary Report\nTotal Registered Students: ${d.total_students}\nVerified Students: ${d.verified_students}\nPlacement Rate: ${d.placement_rate}%\nSelected Students: ${d.selected_students}\nActive Jobs: ${d.active_jobs}\n`;
        const blob = new Blob([content], { type: 'text/csv' });
        triggerDownload(blob, reportName.replace(".xlsx", ".csv").replace(".pdf", ".csv"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export report dataset.");
    }
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  useEffect(() => {
    Promise.all([
      api.getStudents(),
      api.getDashboard()
    ])
    .then(([studentsRes, dashRes]) => {
      const students = studentsRes.data?.results || studentsRes.data || [];
      const dash = dashRes.data || {};

      setReportsData([
        { id: 1, name: "Placement_Summary_2026.pdf", type: "Placement", format: "PDF", date: "12-07-2026", size: "2.4 MB", by: "System Autogen", records: dash.total_students || 120 },
        { id: 2, name: "Company_Wise_Hiring.xlsx", type: "Company", format: "Excel", date: "11-07-2026", size: "1.1 MB", by: "Placement Officer", records: dash.total_companies || 12 },
        { id: 3, name: "Student_Unplaced_List.xlsx", type: "Student", format: "Excel", date: "09-07-2026", size: "850 KB", by: "Placement Officer", records: (dash.total_students - dash.selected_students) || 45 },
        { id: 4, name: "Department_Performance_Q2.pdf", type: "Drive", format: "PDF", date: "01-07-2026", size: "3.2 MB", by: "System Autogen", records: students.length }
      ]);

      setScheduledReports([
        { id: 1, name: "Weekly Enrollment Summary", frequency: "Weekly", format: "Excel", nextRun: "19-07-2026" },
        { id: 2, name: "Monthly Drive Auditing", frequency: "Monthly", format: "PDF", nextRun: "01-08-2026" }
      ]);

      setTrendData([
        { name: "2023", reports: 68 },
        { name: "2024", reports: 75 },
        { name: "2025", reports: 81 },
        { name: "2026", reports: Math.round(dash.placement_rate || 85) }
      ]);

      const depts = {};
      students.forEach(s => {
        const d = s.branch || "CSE";
        depts[d] = (depts[d] || 0) + 1;
      });
      const pie = Object.keys(depts).map((k, idx) => ({
        name: k.toUpperCase(),
        value: depts[k],
        color: idx === 0 ? "#3b82f6" : idx === 1 ? "#10b981" : idx === 2 ? "#f59e0b" : "#ef4444"
      }));
      setPieData(pie.length > 0 ? pie : [
        { name: 'CSE', value: 45, color: '#3b82f6' },
        { name: 'ECE', value: 30, color: '#10b981' }
      ]);

      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to load reports data', err);
      setLoading(false);
    });
  }, []);

  const getTypeStyle = (type) => {
    switch(type) {
      case 'Placement': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Drive': return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'Student': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Company': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'Offer': return 'bg-slate-50 text-slate-600 border border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  const getFormatStyle = (format) => {
    if (format === 'PDF') return 'bg-red-50 text-red-600 border border-red-100';
    if (format === 'Excel') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    return 'bg-slate-50 text-slate-600 border border-slate-100';
  };

  return (
    <div className="bg-[#F8F9FA] min-h-[calc(100vh-64px)] p-6 lg:p-8 font-sans text-slate-800">
      
      {/* 1. Header & Filter Toolbar */}
      <div className="mb-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Generate and view placement reports and analytics.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 items-center">
          <div className="relative w-full xl:w-auto flex-1 max-w-sm">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" defaultValue="01 May 2025 - 31 May 2025" readOnly className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none cursor-pointer bg-slate-50 font-medium" />
          </div>
          
          <div className="flex w-full xl:w-auto gap-3 overflow-x-auto pb-2 xl:pb-0">
            <div className="relative shrink-0">
              <select className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium appearance-none pr-9 min-w-[150px] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Departments</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
            <div className="relative shrink-0">
              <select className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium appearance-none pr-9 min-w-[130px] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Batches</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
            <div className="relative shrink-0">
              <select className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium appearance-none pr-9 min-w-[160px] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Report Types</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto xl:ml-auto">
            <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30">
              <Check size={16} /> Apply Filters
            </button>
            <button className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap px-2">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* 2. Metrics Summary Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Reports</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100"><FileText size={14}/></div>
          </div>
          <div className="text-3xl font-black text-slate-800 mt-1">48</div>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> +14.3% vs last month
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reports Generated</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100"><FileBarChart size={14}/></div>
          </div>
          <div className="text-3xl font-black text-slate-800 mt-1">28</div>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> +16.7% vs last month
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reports Downloaded</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100"><Download size={14}/></div>
          </div>
          <div className="text-3xl font-black text-slate-800 mt-1">19</div>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> +11.8% vs last month
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Reports</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100"><Clock size={14}/></div>
          </div>
          <div className="text-3xl font-black text-slate-800 mt-1">7</div>
          <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> No change
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-amber-300 transition-colors">
           <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Generated</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100"><Activity size={14}/></div>
          </div>
          <div className="text-[17px] font-black text-slate-800 leading-tight mt-2">31 May 2025</div>
          <div className="text-[15px] font-bold text-slate-500 leading-tight">at 10:30 AM</div>
        </div>
      </div>

      {/* 3. Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Reports Generated Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h2 className="text-[15px] font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="text-blue-500" size={18} /> Reports Generated Trend
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6'}} activeDot={{r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports by Type */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 flex flex-col">
          <h2 className="text-[15px] font-bold text-slate-800 mb-2 flex items-center gap-2">
            <FilePieChart className="text-indigo-500" size={18} /> Reports by Type
          </h2>
          <div className="flex-1 flex items-center justify-between mt-2">
            <div className="h-[180px] w-[180px] relative -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black text-slate-800">100%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 ml-2">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-3.5 h-3.5 rounded-full shadow-sm group-hover:scale-110 transition-transform" style={{backgroundColor: item.color}}></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 leading-none group-hover:text-slate-900">{item.name}</span>
                    <span className="text-[11px] font-semibold text-slate-500 mt-1">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Data Table & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Reports Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-[15px] font-bold text-slate-800">Recent Reports</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Search reports..." className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-56 shadow-sm" />
              </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4">Report Name</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Generated On</th>
                    <th className="px-5 py-4 text-center">Format</th>
                    <th className="px-5 py-4 text-right">Records</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        Loading reports...
                      </td>
                    </tr>
                  ) : reportsData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        No reports found.
                      </td>
                    </tr>
                  ) : (
                    reportsData.map(report => (
                      <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                              <FileText size={16} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[13px]">{report.name}</div>
                              <div className="text-[11px] font-medium text-slate-500 mt-1">By {report.by}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider ${getTypeStyle(report.type)}`}>
                            {report.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-slate-600 font-semibold whitespace-nowrap">{report.date}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${getFormatStyle(report.format)}`}>
                            {report.format}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-slate-800">{report.records.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="View"><Eye size={16}/></button>
                            <button onClick={() => handleDownloadReport(report.name, report.type)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100" title="Download"><Download size={16}/></button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200" title="More"><MoreVertical size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-xl">
              <span className="text-xs font-semibold text-slate-500">Showing 1 to 6 of 48 reports</span>
              <button className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 transition-colors group">
                View All Reports <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>
          </div>

          {/* Bottom Notice Banner */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-indigo-900">Data Availability Notice</h4>
              <p className="text-[12px] font-medium text-indigo-700/80 mt-1 leading-relaxed">
                Reports are generated based on the selected filters and data availability. Real-time metrics might have a slight delay of up to 15 minutes due to system processing intervals.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Panels */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-[15px] font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Activity className="text-slate-400" size={18} /> Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDownloadReport("Placement_Summary.csv", "Placement")} className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all text-left group">
                <div className="w-10 h-10 rounded-lg bg-white border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <BarChart2 size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-blue-800">Generate Placement Summary</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">Comprehensive overview of all stats</p>
                </div>
              </button>

              <button onClick={() => handleDownloadReport("Student_Placement_Report.csv", "Student")} className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm transition-all text-left group">
                <div className="w-10 h-10 rounded-lg bg-white border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <Users size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-emerald-800">Student Placement Report</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">Detailed records by department/batch</p>
                </div>
              </button>

              <button onClick={() => handleDownloadReport("Company_Participation_Report.csv", "Company")} className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 hover:shadow-sm transition-all text-left group">
                <div className="w-10 h-10 rounded-lg bg-white border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                  <Building2 size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-amber-800">Company Participation Report</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">Recruiter metrics and offers</p>
                </div>
              </button>

              <button onClick={() => handleDownloadReport("All_System_Export.csv", "All")} className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm transition-all text-left group">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-slate-700 group-hover:text-white transition-all shadow-sm">
                  <Download size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-slate-900">Export All Data</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">Download raw CSV archive</p>
                </div>
              </button>
            </div>
          </div>

          {/* Scheduled Reports Feed */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
              <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                <Clock className="text-slate-400" size={18}/> Scheduled Reports
              </h2>
              <button className="text-[11px] font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors">View All</button>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              {loading ? (
                <div className="text-center text-slate-500 py-4">Loading schedules...</div>
              ) : scheduledReports.length === 0 ? (
                <div className="text-center text-slate-500 py-4">No schedules found.</div>
              ) : (
                scheduledReports.map(sr => (
                  <div key={sr.id} className="flex items-start gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-sm ${sr.status === 'Active' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-300'}`}></div>
                    <div className="flex-1">
                      <h4 className="text-[13px] font-bold text-slate-800 leading-none">{sr.name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          <CalendarIcon size={10} className="text-slate-400"/> {sr.freq}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          <Clock size={10} className="text-slate-400"/> {sr.time}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${sr.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {sr.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 pt-0 mt-2">
              <button className="w-full py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all">
                Manage Scheduled Reports
              </button>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default ReportsAnalyticsDashboard;
