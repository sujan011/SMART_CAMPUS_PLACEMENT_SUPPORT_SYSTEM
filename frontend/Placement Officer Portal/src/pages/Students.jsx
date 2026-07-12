import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronDown, Download, Users, ShieldCheck, 
  UserCheck, Briefcase, Eye, MoreVertical, SlidersHorizontal, CheckCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

const StatusBadge = ({ status }) => {
  if (status === 'Verified' || status === 'Eligible' || status === 'Placed') {
    return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">{status}</span>;
  }
  if (status === 'Pending' || status === 'In Process' || status === 'Shortlisted') {
    return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700">{status}</span>;
  }
  return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
};

const Students = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudents()
      .then(res => {
        setStudentsData(res.data.results || res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch students data', err);
        setLoading(false);
      });

    // Provide default charts
    setChartData([
      { name: 'Jan', applied: 10, eligible: 8 },
      { name: 'Feb', applied: 20, eligible: 15 },
      { name: 'Mar', applied: 35, eligible: 28 },
      { name: 'Apr', applied: 50, eligible: 42 },
    ]);
  }, []);

  const handleVerify = (id) => {
    api.verifyStudent(id)
      .then(() => {
        alert("Student profile verified successfully!");
        setStudentsData(prev => prev.map(s => s.id === id ? { ...s, is_verified: true } : s));
      })
      .catch(err => {
        console.error(err);
        alert("Verification failed.");
      });
  };

  return (
    <div className="bg-[#F8F9FA] min-h-[calc(100vh-64px)] p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and view student information and placement readiness.</p>
        </div>
      </div>

      {/* Top KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* KPI Card 1: Total Students (Purple) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                <Users size={20} />
              </div>
              <p className="text-sm text-slate-500 font-medium">Total Students</p>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">{studentsData.length}</h2>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-500 font-medium flex items-center">
                ↑ 100%
              </span>
              <span className="text-slate-400">active database profiles</span>
            </div>
          </div>

          {/* KPI Card 2: Placement Eligible (Green) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm text-slate-500 font-medium">Eligible Students</p>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">{studentsData.filter(s => parseFloat(s.cgpa) >= 6.0).length}</h2>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-500 font-medium flex items-center">
                CGPA &ge; 6.0
              </span>
              <span className="text-slate-400">cutoff criteria</span>
            </div>
          </div>

          {/* KPI Card 3: Placed Students (Blue) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <UserCheck size={20} />
              </div>
              <p className="text-sm text-slate-500 font-medium">Verified Profiles</p>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">{studentsData.filter(s => s.is_verified).length}</h2>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-500 font-medium flex items-center">
                Approved
              </span>
              <span className="text-slate-400">by TPO officer</span>
            </div>
          </div>

          {/* KPI Card 4: Internship Students (Orange) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                <Briefcase size={20} />
              </div>
              <p className="text-sm text-slate-500 font-medium">Pending Review</p>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">{studentsData.filter(s => !s.is_verified).length}</h2>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="text-amber-500 font-medium flex items-center">
                Awaiting
              </span>
              <span className="text-slate-400">TPO verification</span>
            </div>
          </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Main Content Pane */}
        <div className="w-full flex flex-col gap-6">
          
          {/* Row 1: Search Bar & Row 2: Filters combined in a toolbar */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search students by name, roll no, email..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-slate-50"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white">
                All Departments <ChevronDown size={16} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white">
                All Batches <ChevronDown size={16} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white">
                <SlidersHorizontal size={16} className="text-purple-600"/> More Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-purple-200 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors">
                <Download size={16} /> Export
              </button>
            </div>
          </div>

          {/* Row 3: Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100 font-medium">
                  <tr>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">Roll No.</th>
                    <th className="px-6 py-4 font-medium">Department</th>
                    <th className="px-6 py-4 font-medium">Batch</th>
                    <th className="px-6 py-4 font-medium">CGPA</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        Loading students...
                      </td>
                    </tr>
                  ) : studentsData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    studentsData.map((student, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name || student.email || "S")}&background=random`} alt={student.full_name} className="w-8 h-8 rounded-full" />
                            <div>
                              <div className="font-medium text-slate-900">{student.full_name || "New Student"}</div>
                              <div className="text-xs text-slate-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{student.enrollment_no || "N/A"}</td>
                        <td className="px-6 py-4 text-slate-500">{student.branch || "N/A"}</td>
                        <td className="px-6 py-4 text-slate-500">{student.passing_year || "N/A"}</td>
                        <td className="px-6 py-4 font-medium">{student.cgpa !== null ? Number(student.cgpa).toFixed(2) : "N/A"}</td>
                        <td className="px-6 py-4"><StatusBadge status={student.is_verified ? "Verified" : "Pending"} /></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!student.is_verified && (
                              <button onClick={() => handleVerify(student.id)} title="Verify Profile" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"><Eye size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <div>Showing 1 to 10 of 1,248 students</div>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-400">&lt;</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-600 text-white font-medium">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700">3</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-400">&gt;</button>
              </div>
            </div>
          </div>

          {/* Row 4: Analytics Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="mb-6">
              <h3 className="font-bold text-slate-800">Placement Eligible vs. Applied Students</h3>
              <p className="text-sm text-slate-500">Trend over the last 6 months</p>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEligible" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area type="monotone" dataKey="applied" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorApplied)" />
                    <Area type="monotone" dataKey="eligible" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEligible)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
