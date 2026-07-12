import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle, XCircle, Clock, Award, ShieldAlert, ArrowRight, Eye } from 'lucide-react';
import { api } from '../services/api';

const StatusBadge = ({ status }) => {
  const normalized = status?.toLowerCase() || 'applied';
  if (normalized === 'selected' || normalized === 'offer_received') {
    return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700 uppercase tracking-wide">Selected</span>;
  }
  if (normalized === 'shortlisted') {
    return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 uppercase tracking-wide">Shortlisted</span>;
  }
  if (normalized === 'rejected') {
    return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-700 uppercase tracking-wide">Rejected</span>;
  }
  return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-700 uppercase tracking-wide">Applied</span>;
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadApplications = () => {
    setLoading(true);
    api.getApplications()
      .then(res => {
        setApplications(res.data.results || res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load student applications", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateApplicationStatus(id, { status: newStatus });
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      alert(`Application status updated to ${newStatus.toUpperCase()} successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to update application status.");
    }
  };

  // Filter & Search Logic
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      (app.student?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.job?.company_name || app.job?.company?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.job?.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || app.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-[#F8F9FA] min-h-[calc(100vh-64px)] p-6 lg:p-8 font-sans">
      
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Applications</h1>
          <p className="text-sm text-slate-500 mt-1">Review and manage application recruitment statuses for students.</p>
        </div>
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Applications</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{applications.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Shortlisted</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {applications.filter(a => a.status === 'shortlisted').length}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Award size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Placed / Offers</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {applications.filter(a => a.status === 'selected' || a.status === 'offer_received').length}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Awaiting Review</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {applications.filter(a => a.status === 'applied').length}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><ShieldAlert size={20} /></div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student, company, or job role..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="relative shrink-0">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium appearance-none pr-9 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200 font-medium">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Applied Job</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                    Loading application records...
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                    No applications found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.student?.full_name || app.student?.email || "S")}&background=random`} 
                          alt="Student Avatar" 
                          className="w-8 h-8 rounded-full" 
                        />
                        <div>
                          <div className="font-semibold text-slate-900">{app.student?.full_name || "New Candidate"}</div>
                          <div className="text-xs text-slate-400">{app.student?.email || app.student?.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{app.job?.title || "Role"}</td>
                    <td className="px-6 py-4 text-slate-500">{app.job?.company_name || app.job?.company?.name || "Company"}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(app.applied_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {app.status === 'applied' && (
                          <button 
                            onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Shortlist
                          </button>
                        )}
                        {(app.status === 'applied' || app.status === 'shortlisted') && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(app.id, 'selected')}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Select
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(app.id, 'rejected')}
                              className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
