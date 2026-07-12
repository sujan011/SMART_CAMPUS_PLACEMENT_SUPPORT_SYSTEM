import React, { useState, useEffect, useMemo } from 'react';
import { Search, Upload, X, GraduationCap, Building2, DollarSign, BookOpen, Calendar, User, Trash2, ImagePlus } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../services/api';

const PlacementCellDashboard = () => {
  const pieColors = ['#10b981', '#cbd5e1'];

  // State for Data
  const [students, setStudents] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getStudents(),
      api.getDashboard()
    ])
    .then(([studentsRes, dashboardRes]) => {
      const studentList = studentsRes.data?.results || studentsRes.data || [];
      const dash = dashboardRes.data || {};
      
      const mappedStudents = studentList.map(st => ({
        id: st.id.toString(),
        name: st.full_name || st.email || "New Student",
        rollNo: st.enrollment_no || "N/A",
        stream: st.branch || "CSE",
        batch: st.passing_year || "2021-25",
        company: st.is_verified ? "TCS" : "N/A",
        ctc: st.is_verified ? "7.5" : "N/A",
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(st.full_name || 'S')}&background=random`
      }));
      setStudents(mappedStudents);

      const placedCount = dash.selected_students || 0;
      const unplacedCount = Math.max(0, (dash.total_students || studentList.length) - placedCount);

      setPieData([
        { name: "Placed", value: placedCount },
        { name: "Unplaced", value: unplacedCount }
      ]);

      const branchStats = {};
      studentList.forEach(st => {
        const branch = st.branch || "CSE";
        if (!branchStats[branch]) {
          branchStats[branch] = { name: branch.toUpperCase(), applied: 0, placed: 0 };
        }
        branchStats[branch].applied += 1;
        if (st.is_verified) {
          branchStats[branch].placed += 1;
        }
      });
      setBarData(Object.values(branchStats));
      
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch placements data', err);
      setLoading(false);
    });
  }, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStream, setFilterStream] = useState('All');
  const [filterBatch, setFilterBatch] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newRecord, setNewRecord] = useState({ name: '', rollNo: '', stream: 'CSE', batch: '2021-25', company: '', ctc: '', photoUrl: null });
  const [isDragging, setIsDragging] = useState(false);

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setNewRecord({...newRecord, photoUrl: URL.createObjectURL(file)});
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setNewRecord({...newRecord, photoUrl: URL.createObjectURL(file)});
      }
    }
  };

  // Add Record Handler
  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!newRecord.name || !newRecord.rollNo || !newRecord.company || !newRecord.ctc) {
      alert('Please fill out all required fields.');
      return;
    }
    
    const recordToAdd = {
      id: Date.now().toString(),
      ...newRecord
    };

    setStudents([recordToAdd, ...students]);
    setNewRecord({ name: '', rollNo: '', stream: 'CSE', batch: '2021-25', company: '', ctc: '', photoUrl: null });
    setShowModal(false);
  };

  // Delete Record Handler
  const handleDeleteRecord = (id) => {
    setStudents(students.filter(student => student.id !== id));
  };

  // Filter Logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStream = filterStream === 'All' || student.stream === filterStream;
      const matchesBatch = filterBatch === 'All' || student.batch === filterBatch;

      return matchesSearch && matchesStream && matchesBatch;
    });
  }, [students, searchQuery, filterStream, filterBatch]);

  return (
    <div className="bg-[#F8F9FA] min-h-[calc(100vh-64px)] p-6 lg:p-8 font-sans">
      
      {/* 1. Dashboard Header & Visualizations */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Placement Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of placement statistics and student achievements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Pie Chart: Placed vs Unplaced */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Placement Status</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Applied vs Placed */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Applied vs. Placed Offers</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" align="right" height={36} iconType="circle"/>
                <Bar dataKey="applied" name="Applied" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="placed" name="Placed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Achievement Section & Filters */}
      <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={24} />
            Student Achievements
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-auto flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, company, or roll number..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          {/* Filters */}
          <select 
            value={filterStream}
            onChange={(e) => setFilterStream(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
          >
            <option value="All">All Streams</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>

          <select 
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
          >
            <option value="All">All Batches</option>
            <option value="2022-26">2022-26</option>
            <option value="2021-25">2021-25</option>
            <option value="2020-24">2020-24</option>
          </select>

          <button 
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-500/30"
          >
            <Upload size={16} /> Upload
          </button>
        </div>
      </div>

      {/* 3. Student Achievement Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-lg font-medium text-slate-600">Loading achievements...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
          <GraduationCap className="mx-auto mb-3 text-slate-300" size={48} />
          <p className="text-lg font-medium text-slate-600">No achievements found</p>
          <p className="text-sm mt-1">Try adjusting your filters or upload a new record.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden flex flex-col group relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Delete Button */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => handleDeleteRecord(student.id)}
                  className="p-1.5 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shadow-sm border border-slate-200 transition-colors"
                  title="Delete Record"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-5 flex items-center gap-4 border-b border-slate-50">
                <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                  <img src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.name}&background=eff6ff&color=3b82f6`} alt={student.name} className="w-full h-full object-cover"/>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-[15px]">{student.name}</h3>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{student.rollNo}</div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BookOpen size={16} className="text-slate-400" />
                  <span className="font-medium">{student.stream}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span>Batch: {student.batch}</span>
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center bg-white shadow-sm overflow-hidden shrink-0">
                       <img src={`https://logo.clearbit.com/${student.company.toLowerCase().replace(' ', '')}.com`} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${student.company}&background=random&font-size=0.4&bold=true` }} alt={student.company} className="w-full h-full object-cover"/>
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{student.company}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    {student.ctc}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Upload size={20} className="text-blue-600"/>
                Upload Achievement
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddRecord} className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-5">
                
                {/* Drag and Drop Image Uploader */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Student Photo</label>
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                      ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-slate-100'}
                    `}
                    onClick={() => document.getElementById('photo-upload').click()}
                  >
                    <input 
                      type="file" 
                      id="photo-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {newRecord.photoUrl ? (
                      <div className="relative">
                        <img src={newRecord.photoUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" />
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setNewRecord({...newRecord, photoUrl: null}); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                          <ImagePlus size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Student Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input type="text" required value={newRecord.name} onChange={(e) => setNewRecord({...newRecord, name: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="e.g. John Doe" />
                  </div>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Roll Number</label>
                  <input type="text" required value={newRecord.rollNo} onChange={(e) => setNewRecord({...newRecord, rollNo: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="e.g. 21CS001" />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stream</label>
                  <select value={newRecord.stream} onChange={(e) => setNewRecord({...newRecord, stream: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Batch (Passing Year)</label>
                  <select value={newRecord.batch} onChange={(e) => setNewRecord({...newRecord, batch: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
                    <option value="2022-26">2022-26</option>
                    <option value="2021-25">2021-25</option>
                    <option value="2020-24">2020-24</option>
                  </select>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">CTC Package</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input type="text" required value={newRecord.ctc} onChange={(e) => setNewRecord({...newRecord, ctc: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="e.g. 12 LPA" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input type="text" required value={newRecord.company} onChange={(e) => setNewRecord({...newRecord, company: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="e.g. Google" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlacementCellDashboard;
