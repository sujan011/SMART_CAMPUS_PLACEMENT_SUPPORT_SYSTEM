import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Building2, Briefcase, Search, ChevronDown, ChevronLeft, ChevronRight, Check, Video, User, X } from 'lucide-react';
import { api } from '../services/api';

const ScheduleInterviewsDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getApplications(),
      api.getCompanies(),
      api.getJobs()
    ])
    .then(([appsRes, cosRes, jobsRes]) => {
      const apps = appsRes.data.results || appsRes.data || [];
      const mapped = apps.map(app => ({
        id: app.id,
        name: app.student?.full_name || app.student?.email || "New Student",
        email: app.student?.email || "",
        roll: app.student?.enrollment_no || "N/A",
        dept: app.student?.branch || "N/A",
        cgpa: app.student?.cgpa || 0.0,
        status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
        date: new Date(app.applied_at).toLocaleDateString()
      }));
      setCandidates(mapped);
      setCompanies(cosRes.data.results || cosRes.data || []);
      setJobs(jobsRes.data.results || jobsRes.data || []);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch data for scheduling interviews', err);
      setLoading(false);
    });
  }, []);

  const [selectedCandidates, setSelectedCandidates] = useState([1, 2]);

  // Form states
  const [selectedCompany, setSelectedCompany] = useState("TCS");
  const [selectedJob, setSelectedJob] = useState("Software Developer");
  const [selectedDrive, setSelectedDrive] = useState("TCS Ninja Hiring 2025");
  const [selectedRound, setSelectedRound] = useState("Technical Interview");
  const [interviewDate, setInterviewDate] = useState("2026-07-24");
  const [interviewTime, setInterviewTime] = useState("11:00");
  const [selectedDuration, setSelectedDuration] = useState("45 Minutes");
  const [selectedMode, setSelectedMode] = useState("Online");
  const [interviewersList, setInterviewersList] = useState(["Rahul Sharma", "Neha Kumari"]);
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/abc-defg-hij");
  const [newInterviewerName, setNewInterviewerName] = useState("");

  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (interviewDate) {
      const d = new Date(interviewDate);
      if (!isNaN(d.getTime())) {
        setCalMonth(d.getMonth());
        setCalYear(d.getFullYear());
      }
    }
  }, [interviewDate]);

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysCount = getDaysInMonth(calYear, calMonth);
  const startDayOfWeek = getFirstDayOfMonth(calYear, calMonth);

  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysCount; d++) {
    calendarDays.push(d);
  }

  const isSelectedDate = (day) => {
    if (!day) return false;
    const selectDate = new Date(interviewDate);
    return selectDate.getDate() === day && 
           selectDate.getMonth() === calMonth && 
           selectDate.getFullYear() === calYear;
  };

  const handleCalendarDayClick = (day) => {
    if (!day) return;
    const formattedMonth = String(calMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    setInterviewDate(`${calYear}-${formattedMonth}-${formattedDay}`);
  };

  const [activeDetails, setActiveDetails] = useState({
    company: "TCS",
    position: "Software Developer",
    round: "Technical Interview",
    dateTime: "24 May 2025, 11:00 AM",
    mode: "Online",
    duration: "45 Minutes",
    interviewers: "Rahul Sharma, Neha Kumari"
  });

  const handleAddInterviewer = (e) => {
    e.preventDefault();
    if (!newInterviewerName.trim()) return;
    setInterviewersList([...interviewersList, newInterviewerName.trim()]);
    setNewInterviewerName("");
  };

  const handleRemoveInterviewer = (index) => {
    setInterviewersList(interviewersList.filter((_, idx) => idx !== index));
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (selectedCandidates.length === 0) {
      alert("Please select at least one candidate first!");
      return;
    }

    const durationNum = parseInt(selectedDuration) || 30;
    const ISO_DateTime = `${interviewDate}T${interviewTime}:00Z`;

    try {
      // Create backend schedules for each selected candidate
      await Promise.all(selectedCandidates.map(candidateId => 
        api.scheduleInterview(candidateId, {
          scheduled_at: ISO_DateTime,
          duration_minutes: durationNum,
          mode: selectedMode.toLowerCase(),
          meeting_link: selectedMode.toLowerCase() === 'online' ? meetingLink : '',
          venue: selectedMode.toLowerCase() === 'offline' ? meetingLink : '',
          interviewer_notes: `Interviewers: ${interviewersList.join(", ")}`
        })
      ));

      const formattedDate = new Date(interviewDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      
      setActiveDetails({
        company: selectedCompany,
        position: selectedJob,
        round: selectedRound,
        dateTime: `${formattedDate}, ${interviewTime}`,
        mode: selectedMode,
        duration: selectedDuration,
        interviewers: interviewersList.join(", ")
      });

      alert(`Successfully scheduled ${selectedRound} in the database for ${selectedCandidates.length} candidate(s)!`);
      
      // Reload applications to reflect shortlisted statuses
      const appsRes = await api.getApplications();
      const apps = appsRes.data.results || appsRes.data || [];
      const mapped = apps.map(app => ({
        id: app.id,
        name: app.student?.full_name || app.student?.email || "New Student",
        email: app.student?.email || "",
        roll: app.student?.enrollment_no || "N/A",
        dept: app.student?.branch || "N/A",
        cgpa: app.student?.cgpa || 0.0,
        status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
        date: new Date(app.applied_at).toLocaleDateString()
      }));
      setCandidates(mapped);
      setSelectedCandidates([]);
    } catch (err) {
      console.error(err);
      alert("Failed to schedule interview on the backend.");
    }
  };

  const toggleCandidate = (id) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter(cId => cId !== id));
    } else {
      setSelectedCandidates([...selectedCandidates, id]);
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Selected': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Shortlisted': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Applied': return 'bg-amber-50 text-amber-600 border border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-[calc(100vh-64px)] p-6 lg:p-8 font-sans">
      
      {/* 1. Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Schedule Interviews</h1>
        <p className="text-sm text-slate-500 mt-1">Schedule and manage interviews for students with companies.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* =======================================
            LEFT COLUMN (Form & Table)
            ======================================= */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Card 1: Schedule a New Interview Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Schedule a New Interview</h2>
            
            <form onSubmit={handleScheduleInterviewSubmit} className="flex flex-col gap-6">
              {/* Row 1: Company, Job, Drive */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent appearance-none bg-slate-50 cursor-pointer">
                      {companies.length > 0 ? companies.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      )) : (
                        <>
                          <option>TCS</option>
                          <option>Amazon</option>
                          <option>Wipro</option>
                        </>
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Job / Position <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent appearance-none bg-slate-50 cursor-pointer">
                      {jobs.length > 0 ? jobs.map(j => (
                        <option key={j.id} value={j.title}>{j.title}</option>
                      )) : (
                        <option>Software Developer</option>
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Drive <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={selectedDrive} onChange={(e) => setSelectedDrive(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent appearance-none bg-slate-50 cursor-pointer">
                      {jobs.length > 0 ? jobs.map(j => (
                        <option key={j.id} value={`${j.company_name || 'Campus'} Drive - ${j.title}`}>{j.company_name || 'Campus'} Drive - {j.title}</option>
                      )) : (
                        <option>TCS Ninja Hiring 2026</option>
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              {/* Row 2: Round, Date, Time, Duration */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Round <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={selectedRound} onChange={(e) => setSelectedRound(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent appearance-none bg-slate-50 cursor-pointer">
                      <option value="Technical Interview">Technical Interview</option>
                      <option value="HR Interview">HR Interview</option>
                      <option value="Managerial Round">Managerial Round</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date <span className="text-red-500">*</span></label>
                  <div className="relative flex items-center">
                    <CalendarIcon className="absolute left-3 text-slate-400" size={16} />
                    <input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-slate-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Time <span className="text-red-500">*</span></label>
                  <div className="relative flex items-center">
                    <Clock className="absolute left-3 text-slate-400" size={16} />
                    <input type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-slate-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duration <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent appearance-none bg-slate-50 cursor-pointer">
                      <option value="30 Minutes">30 Minutes</option>
                      <option value="45 Minutes">45 Minutes</option>
                      <option value="60 Minutes">60 Minutes</option>
                      <option value="90 Minutes">90 Minutes</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              {/* Row 3: Mode & Venue */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Mode <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-5 mt-1.5">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="radio" name="mode" checked={selectedMode === "Online"} onChange={() => setSelectedMode("Online")} className="peer w-4 h-4 text-[#4F46E5] border-slate-300 focus:ring-[#4F46E5] opacity-0 absolute" />
                        <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-all ${selectedMode === "Online" ? "border-[#4F46E5] bg-[#4F46E5]" : "border-slate-300"}`}>
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <span className={`text-sm ${selectedMode === "Online" ? "font-bold text-[#4F46E5]" : "text-slate-500"}`}>Online</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="radio" name="mode" checked={selectedMode === "Offline"} onChange={() => setSelectedMode("Offline")} className="peer w-4 h-4 border-slate-300 opacity-0 absolute" />
                        <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-all ${selectedMode === "Offline" ? "border-[#4F46E5] bg-[#4F46E5]" : "border-slate-300"}`}>
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <span className={`text-sm ${selectedMode === "Offline" ? "font-bold text-[#4F46E5]" : "text-slate-500"}`}>Offline</span>
                    </label>
                  </div>
                </div>
                
                <div className="md:col-span-8">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Venue / Meeting Link <span className="text-red-500">*</span></label>
                  <input type="text" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-slate-50" />
                </div>
              </div>

              {/* Row 4: Interviewers */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Interviewers <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-slate-50 flex-wrap relative cursor-pointer min-h-[42px]">
                  {interviewersList.map((intv, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs font-semibold shadow-sm">
                      {intv} 
                      <button type="button" onClick={() => handleRemoveInterviewer(idx)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"><X size={12} /></button>
                    </div>
                  ))}
                  <input 
                    type="text" 
                    placeholder="+ Add interviewer (Press Enter)"
                    className="bg-transparent text-xs text-slate-700 outline-none border-none py-1 px-1 placeholder-slate-400 flex-1 min-w-[150px]"
                    value={newInterviewerName}
                    onChange={(e) => setNewInterviewerName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterviewer(e);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-start gap-4 mt-2">
                <button type="button" onClick={() => {
                  setSelectedCandidates([]);
                  setInterviewersList(["Rahul Sharma", "Neha Kumari"]);
                }} className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Reset
                </button>
                <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg shadow-sm shadow-indigo-500/30 flex items-center gap-2 transition-colors">
                  <CalendarIcon size={16} />
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Select Candidates */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Select Candidates</h2>
            
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search candidates by name, roll no..." className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-slate-50" />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
                <div className="relative shrink-0">
                  <select className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium appearance-none pr-9 min-w-[150px] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                    <option>All Departments</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
                <div className="relative shrink-0">
                  <select className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium appearance-none pr-9 min-w-[130px] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                    <option>All Status</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#4F46E5] bg-white border border-[#4F46E5] rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap shrink-0">
                  <span className="text-lg leading-none">+</span> Add Candidates
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl rounded-b-none border-b-0">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <input type="checkbox" className="rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5]" />
                    </th>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Roll No.</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">CGPA</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Application Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">
                        Loading candidates...
                      </td>
                    </tr>
                  ) : candidates.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">
                        No candidates found.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((c, i) => (
                      <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedCandidates.includes(c.id)}
                            onChange={() => toggleCandidate(c.id)}
                            className="rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer" 
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={`https://ui-avatars.com/api/?name=${c.name}&background=random`} alt={c.name} className="w-8 h-8 rounded-full border border-slate-200" />
                            <span className="font-bold text-slate-800">{c.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-700">{c.roll}</td>
                        <td className="p-4">{c.dept}</td>
                        <td className="p-4 font-bold text-slate-700">{c.cgpa}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${getStatusStyle(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">{c.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-0 p-4 border border-slate-100 rounded-xl rounded-t-none bg-slate-50/30 gap-4">
              <p className="text-sm font-medium text-slate-500">Showing 1 to 5 of 25 candidates</p>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><ChevronLeft size={16}/></button>
                <button className="w-8 h-8 flex items-center justify-center bg-[#4F46E5] text-white font-bold rounded-md shadow-sm">1</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-semibold rounded-md transition-colors">2</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-semibold rounded-md transition-colors">3</button>
                <span className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold">...</span>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-semibold rounded-md transition-colors">5</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><ChevronRight size={16}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================
            RIGHT COLUMN (Panels)
            ======================================= */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Panel 1: Interview Schedule Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-[15px] font-bold text-slate-800 mb-5">Interview Schedule Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#4F46E5]">
                  <CalendarIcon size={18} />
                  <div className="text-2xl font-black text-slate-800 ml-auto leading-none">
                    {candidates.filter(c => c.status === 'Shortlisted').length || 1}
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Interviews Today</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-purple-600">
                  <Users size={18} />
                  <div className="text-2xl font-black text-slate-800 ml-auto leading-none">
                    {candidates.filter(c => c.status === 'Shortlisted' || c.status === 'Applied').length || 3}
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Interviews This Week</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Briefcase size={18} />
                  <div className="text-2xl font-black text-slate-800 ml-auto leading-none">
                    {candidates.length}
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Interviews This Drive</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <Clock size={18} />
                  <div className="text-2xl font-black text-slate-800 ml-auto leading-none flex items-baseline">45<span className="text-[11px] text-slate-500 ml-1">min</span></div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Avg. Duration</span>
              </div>
            </div>
          </div>

          {/* Panel 2: Interview Calendar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-[15px] font-bold text-slate-800 mb-5">Interview Calendar</h3>
            <div className="mb-4 flex items-center justify-between px-2">
              <button type="button" onClick={handlePrevMonth} className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-md transition-colors"><ChevronLeft size={16}/></button>
              <h4 className="font-bold text-slate-800 text-sm">{monthNames[calMonth]} {calYear}</h4>
              <button type="button" onClick={handleNextMonth} className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-md transition-colors"><ChevronRight size={16}/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(day => (
                <div key={day} className="text-[11px] font-bold uppercase tracking-wider text-slate-400 py-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-sm items-center justify-items-center">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`pad-${idx}`} className="py-1.5 text-slate-300 font-medium w-8 h-8"></div>;
                }
                const selected = isSelectedDate(day);
                return (
                  <button 
                    key={`day-${day}`}
                    type="button"
                    onClick={() => handleCalendarDayClick(day)}
                    className={`w-8 h-8 flex items-center justify-center font-semibold rounded-full transition-all relative ${
                      selected 
                      ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-200' 
                      : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    {day}
                    {!selected && day % 11 === 0 && <span className="absolute bottom-1 w-1 h-1 bg-amber-500 rounded-full"></span>}
                    {!selected && day % 13 === 0 && <span className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full"></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel 3: Interview Details Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex-1">
            <h3 className="text-[15px] font-bold text-slate-800 mb-5">Interview Details</h3>
            <div className="flex flex-col gap-4 text-sm">
              <div className="grid grid-cols-3 gap-3 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2 text-slate-500 font-semibold"><Building2 size={16}/> Company</div>
                <div className="col-span-2 font-bold text-slate-800">{activeDetails.company}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2 text-slate-500 font-semibold"><Briefcase size={16}/> Position</div>
                <div className="col-span-2 font-bold text-slate-700">{activeDetails.position}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2 text-slate-500 font-semibold"><Check size={16}/> Round</div>
                <div className="col-span-2 font-bold text-slate-700">{activeDetails.round}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2 text-slate-500 font-semibold"><CalendarIcon size={16}/> Date & Time</div>
                <div className="col-span-2 font-bold text-slate-700">{activeDetails.dateTime}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2 text-slate-500 font-semibold"><Video size={16}/> Mode</div>
                <div className="col-span-2 font-bold text-[#4F46E5] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]"></span> {activeDetails.mode}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2 text-slate-500 font-semibold"><Clock size={16}/> Duration</div>
                <div className="col-span-2 font-bold text-slate-700">{activeDetails.duration}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2 text-slate-500 font-semibold"><User size={16}/> Interviewers</div>
                <div className="col-span-2 font-bold text-slate-700 leading-relaxed">{activeDetails.interviewers}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 items-center mt-1">
                <div className="flex items-center gap-2 text-slate-500 font-semibold"><Users size={16}/> Candidates</div>
                <div className="col-span-2">
                  <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md">
                    {selectedCandidates.length} Selected
                  </span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default ScheduleInterviewsDashboard;
