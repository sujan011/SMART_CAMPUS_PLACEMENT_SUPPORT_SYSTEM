import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Building2, Briefcase, MapPin, DollarSign, Clock, MonitorSmartphone, X, Search, ChevronDown } from 'lucide-react';
import { api } from '../services/api';

const Jobs = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.getCompanies(),
      api.getJobs()
    ])
    .then(([companiesRes, jobsRes]) => {
      const companyList = companiesRes.data.results || companiesRes.data;
      const jobList = jobsRes.data.results || jobsRes.data;
      
      const companiesWithJobs = companyList.map(c => ({
        id: c.id,
        name: c.name,
        location: c.headquarters || "General",
        jobs: jobList.filter(j => j.company?.id === c.id || j.company_name === c.name || (j.company && j.company.id === c.id)).map(j => ({
          id: j.id,
          role: j.title,
          package: j.salary_max ? `${j.salary_min / 100000} - ${j.salary_max / 100000} LPA` : "Not Disclosed",
          working: j.is_remote ? "Remote" : "On-site",
          schedule: j.job_type === "full_time" ? "Full-time" : "Internship"
        }))
      }));
      setCompanies(companiesWithJobs);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to load companies & jobs', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', location: '' });

  const [showJobForm, setShowJobForm] = useState(false);
  const [newJob, setNewJob] = useState({ companyId: '', role: '', package: '', working: 'Remote', schedule: 'Full-time', deadline: '' });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // --- Handlers for Companies ---
  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name.trim() || !newCompany.location.trim()) {
      alert('Please fill out all company fields.');
      return;
    }

    try {
      const res = await api.createCompany({
        name: newCompany.name,
        headquarters: newCompany.location
      });
      if (res.status === 201 || res.status === 200) {
        fetchData();
        setNewCompany({ name: '', location: '' });
        setShowCompanyForm(false);
      }
    } catch (err) {
      console.error('Failed to add company', err);
      alert("Failed to add company.");
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      await api.deleteCompany(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete company', err);
      alert("Failed to delete company.");
    }
  };

  // --- Handlers for Jobs ---
  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!newJob.companyId || !newJob.role.trim() || !newJob.package.trim() || !newJob.deadline) {
      alert('Please fill out all job fields, select a company, and choose a deadline.');
      return;
    }
    
    const rawVal = parseFloat(newJob.package.replace(/[^0-9.]/g, '')) || 0;
    const salary = rawVal < 100 ? rawVal * 100000 : rawVal;
    const formattedDeadline = `${newJob.deadline}T23:59:59Z`;

    try {
      const res = await api.createJob({
        company: newJob.companyId,
        title: newJob.role,
        salary_min: salary,
        salary_max: salary,
        is_remote: newJob.working === "Remote",
        job_type: newJob.schedule === "Full-time" ? "full_time" : "internship",
        application_deadline: formattedDeadline,
        required_skills: [],
        description: `${newJob.role} position.`,
        responsibilities: "Responsible for engineering tasks.",
        benefits: "Competitive package."
      });
      if (res.status === 201 || res.status === 200) {
        fetchData();
        setNewJob({ companyId: '', role: '', package: '', working: 'Remote', schedule: 'Full-time', deadline: '' });
        setShowJobForm(false);
      }
    } catch (err) {
      console.error('Failed to add job', err);
      alert("Failed to post job listing.");
    }
  };

  const handleDeleteJob = async (companyId, jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.deleteJob(jobId);
      fetchData();
    } catch (err) {
      console.error('Failed to delete job', err);
      alert("Failed to delete job listing.");
    }
  };

  // --- Filtering Logic ---
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const query = searchQuery.toLowerCase();

    return companies.map(company => {
      const companyMatches = company.name.toLowerCase().includes(query);
      const filteredJobs = company.jobs.filter(job => 
        job.role.toLowerCase().includes(query)
      );

      if (companyMatches) {
        return company; // If company name matches, show the company and all its jobs
      } else if (filteredJobs.length > 0) {
        return { ...company, jobs: filteredJobs }; // If jobs match, show company but only matching jobs
      }
      return null;
    }).filter(Boolean); // Remove null values
  }, [companies, searchQuery]);

  return (
    <div className="bg-[#F8F9FA] min-h-[calc(100vh-64px)] p-6 lg:p-8 font-sans">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recruitment Profiles</h1>
          <p className="text-sm text-slate-500 mt-1">Manage partner companies and their associated job openings.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => { setShowCompanyForm(!showCompanyForm); setShowJobForm(false); }}
            className="flex items-center gap-2 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            {showCompanyForm ? <X size={16} /> : <Building2 size={16} />}
            {showCompanyForm ? 'Cancel' : 'Add Company'}
          </button>
          <button 
            onClick={() => { setShowJobForm(!showJobForm); setShowCompanyForm(false); }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-purple-500/30"
          >
            {showJobForm ? <X size={16} /> : <Plus size={16} />}
            {showJobForm ? 'Cancel' : 'Post New Job'}
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col xl:flex-row gap-3">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs by title, company..." 
            className="w-full pl-11 pr-11 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm text-slate-700"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-purple-600 transition-colors" size={18} />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10 cursor-pointer min-w-[150px] shadow-sm">
              <option>All Companies</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
          <div className="relative">
            <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10 cursor-pointer min-w-[150px] shadow-sm">
              <option>All Job Types</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
          <div className="relative">
            <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10 cursor-pointer min-w-[150px] shadow-sm">
              <option>All Locations</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
          <div className="relative">
            <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10 cursor-pointer min-w-[140px] shadow-sm">
              <option>All Status</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* ==============================================
            ADD COMPANY FORM
            ============================================== */}
        {showCompanyForm && (
          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="text-md font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Add New Company</h3>
            <form onSubmit={handleAddCompany} className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
                <input 
                  type="text" 
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  placeholder="e.g. Acme Corp" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                <input 
                  type="text" 
                  value={newCompany.location}
                  onChange={(e) => setNewCompany({...newCompany, location: e.target.value})}
                  placeholder="e.g. New York, NY" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50"
                />
              </div>
              <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors h-[42px]">
                Save Company
              </button>
            </form>
          </div>
        )}

        {/* ==============================================
            ADD JOB FORM
            ============================================== */}
        {showJobForm && (
          <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <h3 className="text-md font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Post New Job Opening</h3>
            <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Company</label>
                <select 
                  value={newJob.companyId}
                  onChange={(e) => setNewJob({...newJob, companyId: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-slate-50"
                >
                  <option value="">-- Choose a Company --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Job Role</label>
                <input 
                  type="text" 
                  value={newJob.role}
                  onChange={(e) => setNewJob({...newJob, role: e.target.value})}
                  placeholder="e.g. Frontend Developer" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-slate-50"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Package / Salary</label>
                <input 
                  type="text" 
                  value={newJob.package}
                  onChange={(e) => setNewJob({...newJob, package: e.target.value})}
                  placeholder="e.g. 8 LPA" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-slate-50"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Working Mode</label>
                <select 
                  value={newJob.working}
                  onChange={(e) => setNewJob({...newJob, working: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-slate-50"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Schedule</label>
                <select 
                  value={newJob.schedule}
                  onChange={(e) => setNewJob({...newJob, schedule: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-slate-50"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Shift hours">Shift hours</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Application Deadline</label>
                <input 
                  type="date"
                  required
                  value={newJob.deadline}
                  onChange={(e) => setNewJob({...newJob, deadline: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-slate-50"
                />
              </div>
              <div className="lg:col-span-6 flex justify-end mt-2">
                <button type="submit" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-lg text-sm font-medium transition-colors h-[42px] shadow-sm shadow-purple-500/10">
                  Save Job Posting
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==============================================
            RENDER COMPANIES & THEIR JOBS (FILTERED)
            ============================================== */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            <p>Loading profiles...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            <Building2 className="mx-auto mb-3 text-slate-300" size={48} />
            <p>No matching companies or jobs found for "{searchQuery}".</p>
          </div>
        ) : (
          filteredCompanies.map(company => (
            <div key={company.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Company Header */}
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden shrink-0">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${company.name}&background=random&font-size=0.4`} 
                      alt={company.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{company.name}</h2>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                      <MapPin size={14} className="text-slate-400" />
                      {company.location}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteCompany(company.id)}
                  className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium border border-transparent hover:border-red-100"
                >
                  <Trash2 size={16} />
                  Delete Company
                </button>
              </div>

              {/* Jobs Grid for this Company */}
              <div className="p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Briefcase size={16} className="text-purple-500" />
                  Active Openings ({company.jobs.length})
                </h3>
                
                {company.jobs.length === 0 ? (
                  <p className="text-sm text-slate-400 italic bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
                    No active job openings for this company yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {company.jobs.map(job => (
                      <div key={job.id} className="group relative bg-white border border-slate-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-400 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-slate-800 pr-8">{job.role}</h4>
                          <button 
                            onClick={() => handleDeleteJob(company.id, job.id)}
                            className="absolute right-3 top-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Job"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <DollarSign size={14} />
                            </span>
                            <span className="font-medium text-slate-700">{job.package}</span>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              <MonitorSmartphone size={12} />
                              {job.working}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              <Clock size={12} />
                              {job.schedule}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default Jobs;
