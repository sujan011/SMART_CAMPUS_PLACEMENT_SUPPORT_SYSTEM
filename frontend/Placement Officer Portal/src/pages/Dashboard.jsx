import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Users, Building, FileText, Calendar, 
  ArrowUpRight, ArrowDownRight, CheckCircle2,
  Clock, MapPin, Building2, User
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(res => {
        setDashboardData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load officer dashboard", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    total_students = 0,
    verified_students = 0,
    total_companies = 0,
    active_jobs = 0,
    applications = 0,
    selected_students = 0,
    placement_rate = 0,
    recent_students = [],
    recent_applications = [],
    recent_companies = []
  } = dashboardData || {};

  const chartData = [
    { name: 'Jan', value: Math.round(applications * 0.1) },
    { name: 'Feb', value: Math.round(applications * 0.2) },
    { name: 'Mar', value: Math.round(applications * 0.3) },
    { name: 'Apr', value: Math.round(applications * 0.6) },
    { name: 'May', value: Math.round(applications * 0.8) },
    { name: 'Jun', value: applications },
  ];

  const pieData = [
    { name: 'Placed', value: selected_students, color: '#10b981' },
    { name: 'In Process', value: applications - selected_students, color: '#3b82f6' }
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-4">
          <select className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
            <option>All Departments</option>
            <option>Computer Science</option>
            <option>Information Tech</option>
          </select>
          <select className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
            <option>2026 Batch</option>
            <option>2025 Batch</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-500/20">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{total_students}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Users size={24} />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${total_students ? (verified_students / total_students) * 100 : 0}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-3">{verified_students} verified profile(s)</p>
        </div>

        {/* Placement Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Placement Rate</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{placement_rate}%</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: `${placement_rate}%` }}></div>
          </div>
          <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
            {selected_students} student(s) selected
          </p>
        </div>

        {/* Total Recruiters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Registered Companies</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{total_companies}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Building2 size={24} />
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-3">Recruiting organizations in database</p>
        </div>

        {/* Open Job Listings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Open Job Openings</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{active_jobs}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-3">Active drives & job posts</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Application Activity Trend</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Student Placement Status</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-800">{total_students}</span>
              <span className="text-xs text-slate-500">Students</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-center">
            {pieData.map(item => (
              <div key={item.name} className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500">{item.name}</span>
                </div>
                <span className="text-lg font-bold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity / Applications List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Recent Applications</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recent_applications.length > 0 ? (
            recent_applications.map(app => (
              <div key={app.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{app.student?.full_name || app.student?.email || "Student"}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{app.job?.title} at {app.job?.company?.name}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={14} className="text-slate-400" /> Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-lg self-start sm:self-auto uppercase
                    ${app.status === 'selected' ? 'bg-emerald-50 text-emerald-700' : app.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">No recent applications found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
