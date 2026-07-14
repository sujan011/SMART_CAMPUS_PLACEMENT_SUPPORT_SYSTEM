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

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Detail Modal view state
  const [viewingStudent, setViewingStudent] = useState(null);

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
        if (viewingStudent && viewingStudent.id === id) {
          setViewingStudent(prev => ({ ...prev, is_verified: true }));
        }
      })
      .catch(err => {
        console.error(err);
        alert("Verification failed.");
      });
  };

  // Backend now filters only students, so studentsOnly = studentsData
  const studentsOnly = React.useMemo(() => {
    return studentsData;
  }, [studentsData]);

  const departmentsList = React.useMemo(() => {
    const depts = new Set(studentsOnly.map(s => s.branch).filter(Boolean));
    return ['All Departments', ...Array.from(depts)];
  }, [studentsOnly]);

  const batchesList = React.useMemo(() => {
    const batches = new Set(studentsOnly.map(s => s.passing_year).filter(Boolean));
    return ['All Batches', ...Array.from(batches).sort()];
  }, [studentsOnly]);

  const filteredStudents = React.useMemo(() => {
    return studentsOnly.filter(s => {
      const matchesSearch = 
        (s.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.enrollment_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = deptFilter === 'All Departments' || s.branch === deptFilter;
      const matchesBatch = batchFilter === 'All Batches' || String(s.passing_year) === String(batchFilter);
      
      let matchesStatus = true;
      if (statusFilter === 'Verified') matchesStatus = s.is_verified;
      else if (statusFilter === 'Pending') matchesStatus = !s.is_verified;

      return matchesSearch && matchesDept && matchesBatch && matchesStatus;
    });
  }, [studentsOnly, searchQuery, deptFilter, batchFilter, statusFilter]);

  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / pageSize) || 1;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, deptFilter, batchFilter, statusFilter]);

  const paginatedStudents = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage]);

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
            <h2 className="text-3xl font-bold text-slate-800">{studentsOnly.length}</h2>
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
            <h2 className="text-3xl font-bold text-slate-800">{studentsOnly.filter(s => s.cgpa !== null && parseFloat(s.cgpa) >= 6.0).length}</h2>
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
            <h2 className="text-3xl font-bold text-slate-800">{studentsOnly.filter(s => s.is_verified).length}</h2>
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
            <h2 className="text-3xl font-bold text-slate-800">{studentsOnly.filter(s => !s.is_verified).length}</h2>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-slate-50"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {departmentsList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {batchesList.map(batch => (
                    <option key={batch} value={batch}>{batch === 'All Batches' ? 'All Batches' : `Batch ${batch}`}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="All Status">All Status</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending Review</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
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
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student, idx) => (
                      <tr key={student.id || idx} className="hover:bg-slate-50/50 transition-colors group">
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
                            <button onClick={() => setViewingStudent(student)} title="View Details" className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors">
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <div>
                {totalStudents === 0 
                  ? "Showing 0 to 0 of 0 students"
                  : `Showing ${Math.min((currentPage - 1) * pageSize + 1, totalStudents)} to ${Math.min(currentPage * pageSize, totalStudents)} of ${totalStudents} students`
                }
              </div>
              {totalPages > 1 && (
                <div className="flex gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-400 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                    <button 
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md font-medium ${
                        currentPage === page 
                          ? 'bg-purple-600 text-white shadow-sm font-bold' 
                          : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-400 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    &gt;
                  </button>
                </div>
              )}
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

      {/* Details Modal Pop-Up */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(viewingStudent.full_name || viewingStudent.email || "S")}&background=random`} 
                  alt={viewingStudent.full_name} 
                  className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{viewingStudent.full_name || "New Student"}</h3>
                  <p className="text-sm text-slate-500">{viewingStudent.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${viewingStudent.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {viewingStudent.is_verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingStudent(null)} 
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 hover:bg-slate-100 rounded-lg transition-colors leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roll No.</span>
                  <span className="text-sm font-semibold text-slate-700">{viewingStudent.enrollment_no || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
                  <span className="text-sm font-semibold text-slate-700">{viewingStudent.branch || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">CGPA</span>
                  <span className="text-sm font-bold text-slate-700">{viewingStudent.cgpa !== null ? parseFloat(viewingStudent.cgpa).toFixed(2) : 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch (Passing Year)</span>
                  <span className="text-sm font-semibold text-slate-700">{viewingStudent.passing_year || 'N/A'}</span>
                </div>
              </div>

              {/* About Me */}
              {viewingStudent.about_me && (
                <div>
                  <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2">About Me</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{viewingStudent.about_me}</p>
                </div>
              )}

              {/* Academic Records */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Academic Records</h4>
                {viewingStudent.academic_records && viewingStudent.academic_records.length > 0 ? (
                  <div className="space-y-2.5">
                    {viewingStudent.academic_records.map((rec) => (
                      <div key={rec.id} className="flex justify-between items-center text-sm p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <div>
                          <span className="font-semibold text-slate-800">{rec.course}</span>
                          <span className="text-xs text-slate-400 block">{rec.institution} ({rec.start_year} - {rec.end_year})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-700">{rec.score}</span>
                          <span className="text-xs text-slate-400 block">{rec.score_type === 'gpa' ? 'CGPA' : '% Marks'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No academic records added yet.</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Skills</h4>
                {viewingStudent.skills && viewingStudent.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {viewingStudent.skills.map((sk) => (
                      <span key={sk.id} className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {sk.name} ({sk.proficiency})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
                )}
              </div>

              {/* Projects */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Projects</h4>
                {viewingStudent.projects && viewingStudent.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingStudent.projects.map((proj) => (
                      <div key={proj.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
                        <h5 className="font-bold text-slate-800 text-sm">{proj.title}</h5>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                        <div className="flex gap-3 mt-3">
                          {proj.project_url && <a href={proj.project_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Live Link</a>}
                          {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">GitHub</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No projects listed yet.</p>
                )}
              </div>

              {/* Certifications */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Certifications</h4>
                {viewingStudent.certifications && viewingStudent.certifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingStudent.certifications.map((cert) => (
                      <div key={cert.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm">{cert.title}</h5>
                          <p className="text-xs text-slate-500 mt-0.5">{cert.issuer}</p>
                        </div>
                        {cert.credential_url && <a href={cert.credential_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View</a>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No certifications listed yet.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button 
                onClick={() => setViewingStudent(null)} 
                className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {!viewingStudent.is_verified && (
                <button 
                  onClick={() => {
                    handleVerify(viewingStudent.id);
                  }} 
                  className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle size={16} />
                  Verify Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
