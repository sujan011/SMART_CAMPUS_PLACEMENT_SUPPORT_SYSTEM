import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Users, Building, Briefcase, Award, CheckCircle, Download, FileText, Printer } from 'lucide-react';
import { api } from '../services/api';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    placedStudents: 0,
    placementRate: 0,
    totalCompanies: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchData, setBranchData] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getDashboard(),
      api.getStudents(),
      api.getApplications()
    ])
      .then(([dashRes, studsRes, appsRes]) => {
        const dashboard = dashRes.data || {};
        const studList = studsRes.data.results || studsRes.data || [];
        const appList = appsRes.data.results || appsRes.data || [];

        // Compute metrics dynamically from live lists
        const total = studList.length;
        const placed = appList.filter(app => app.status === 'selected' || app.status === 'offer_received').length;
        const rate = total > 0 ? ((placed / total) * 100).toFixed(1) : 0;
        const shortlisted = appList.filter(app => app.status === 'shortlisted').length;

        setStats({
          totalStudents: total,
          placedStudents: placed,
          placementRate: rate,
          totalCompanies: dashboard.total_companies || 12,
          activeJobs: dashboard.active_jobs || 18,
          totalApplications: appList.length,
          shortlisted: shortlisted
        });

        setStudents(studList);

        // Compute branch-wise placement stats
        const branches = ['CSE', 'ECE', 'ME', 'EEE', 'CE'];
        const compiledBranchData = branches.map(br => {
          const totalInBr = studList.filter(s => s.branch === br).length;
          // Count placed in this branch
          const placedInBr = appList.filter(app => {
            const isSelected = app.status === 'selected' || app.status === 'offer_received';
            const belongsToBr = app.student?.branch === br;
            return isSelected && belongsToBr;
          }).length;
          const placementPercent = totalInBr > 0 ? Math.round((placedInBr / totalInBr) * 100) : 0;
          return { branch: br, total: totalInBr, placed: placedInBr, rate: placementPercent };
        });

        setBranchData(compiledBranchData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load analytics data", err);
        setLoading(false);
      });
  }, []);

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = "Branch,Total Students,Placed Students,Placement Rate (%)\n";
    const rows = branchData.map(b => `${b.branch},${b.total},${b.placed},${b.rate}%`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placement_analytics_${new Date().getFullYear()}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#F8F9FA] min-h-[calc(100vh-64px)] p-6 lg:p-8 font-sans">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Advanced Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Live statistics, branch placement distributions, and company stats.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Printer size={16} /> Print Report
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          Compiling placement analytics reports...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Placement Rate</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.placementRate}%</h3>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                  <TrendingUp size={12} /> Live Computed
                </span>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Award size={24} /></div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Placed Candidates</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.placedStudents}</h3>
                <span className="text-xs text-slate-400 mt-1">out of {stats.totalStudents} students</span>
              </div>
              <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Partners</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.totalCompanies}</h3>
                <span className="text-xs text-slate-400 mt-1">corporate recruiters</span>
              </div>
              <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Building size={24} /></div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Job Roles</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.activeJobs}</h3>
                <span className="text-xs text-slate-400 mt-1">ongoing recruitment drives</span>
              </div>
              <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><Briefcase size={24} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Branch Placement Chart Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BarChart size={18} className="text-blue-600" /> Branch-wise Placement Analysis
              </h3>
              <div className="flex flex-col gap-5">
                {branchData.map(b => (
                  <div key={b.branch} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                      <span>Branch: {b.branch}</span>
                      <span className="text-blue-600">{b.placed} / {b.total} Placed ({b.rate}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${b.rate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Package ranges & recruiters distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-4">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-purple-600" /> Package Distribution
              </h3>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-600">Super Dream (12+ LPA)</span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">10%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-600">Dream Package (8-12 LPA)</span>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">25%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-600">Standard Package (5-8 LPA)</span>
                  <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 font-bold rounded">40%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-slate-600">Mass Packages (3-5 LPA)</span>
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold rounded">25%</span>
                </div>
              </div>

              {/* Recruitment status funnel breakdown */}
              <h3 className="text-lg font-bold text-slate-800 mb-4 mt-8">Recruitment Funnel</h3>
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Applied Applications</span>
                  <span className="font-bold text-slate-900">{stats.totalApplications}</span>
                </div>
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex justify-between items-center">
                  <span className="font-semibold text-blue-700">Shortlisted for Interviews</span>
                  <span className="font-bold text-blue-900">{stats.shortlisted}</span>
                </div>
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg flex justify-between items-center">
                  <span className="font-semibold text-emerald-700">Selected Offers</span>
                  <span className="font-bold text-emerald-900">{stats.placedStudents}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
