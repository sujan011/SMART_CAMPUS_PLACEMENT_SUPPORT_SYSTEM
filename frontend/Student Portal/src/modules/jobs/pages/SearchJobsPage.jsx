import React, { useState, useEffect } from 'react';
import { JobCard } from '../components/JobCard';
import { api } from '../../../core/services/api';

export const SearchJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [profile, setProfile] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [detailedJob, setDetailedJob] = useState(null);
    
    // States for loading/error
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Search and filters
    const [search, setSearch] = useState("");
    const [jobTypeFilter, setJobTypeFilter] = useState("All");
    const [workModeFilter, setWorkModeFilter] = useState("All");
    const [eligibilityFilter, setEligibilityFilter] = useState("All");
    const [sortBy, setSortBy] = useState("newest");

    // Apply modal state
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [coverNote, setCoverNote] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [applyError, setApplyError] = useState("");
    const [applySuccess, setApplySuccess] = useState(false);

    // Initial loaders
    const loadJobsAndProfile = async () => {
        setIsLoading(true);
        try {
            const [jobsRes, profileRes, appsRes] = await Promise.all([
                api.getJobs(),
                api.getProfile(),
                api.getApplications()
            ]);
            
            const jobsList = jobsRes.data.results || jobsRes.data || [];
            setJobs(jobsList);
            setProfile(profileRes.data);
            setApplications(appsRes.data.results || appsRes.data || []);
            
            if (jobsList.length > 0) {
                setSelectedJobId(jobsList[0].id);
            }
        } catch (err) {
            setError(err.message || "Failed to load jobs data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadJobsAndProfile();
    }, []);

    // Load detailed job on selected ID change
    useEffect(() => {
        if (!selectedJobId) {
            setDetailedJob(null);
            return;
        }

        const fetchDetails = async () => {
            setIsDetailsLoading(true);
            try {
                const res = await api.getJobDetails(selectedJobId);
                setDetailedJob(res.data);
            } catch (err) {
                console.error("Failed to load job details:", err);
            } finally {
                setIsDetailsLoading(false);
            }
        };

        fetchDetails();
    }, [selectedJobId]);

    // Check application status
    const getApplicationForJob = (jobId) => {
        return applications.find(app => app.job?.id === jobId || app.job === jobId);
    };

    // Toggle save/unsave
    const handleSaveToggle = async (jobId) => {
        try {
            const res = await api.saveJob(jobId);
            const isSaved = res.data.is_saved;
            
            // Update in lists
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: isSaved } : j));
            if (detailedJob && detailedJob.id === jobId) {
                setDetailedJob(prev => ({ ...prev, is_saved: isSaved }));
            }
        } catch (err) {
            console.error("Failed to toggle save:", err);
        }
    };

    // Local eligibility checker
    const checkEligibility = (job) => {
        if (!profile || !job) return { eligible: true, reasons: [] };
        const reasons = [];

        // Verification check
        if (!profile.is_verified) {
            reasons.push("Your student profile has not been verified by the Placement Officer.");
        }

        // CGPA check
        if (profile.cgpa === null || profile.cgpa === undefined) {
            reasons.push("CGPA is missing in your student profile.");
        } else if (parseFloat(profile.cgpa) < parseFloat(job.min_cgpa)) {
            reasons.push(`Minimum CGPA required is ${job.min_cgpa} (Your CGPA: ${profile.cgpa}).`);
        }

        // Branch check
        if (job.eligible_branches && job.eligible_branches.length > 0) {
            if (!profile.branch) {
                reasons.push("Branch is missing in your profile.");
            } else {
                const isBranchEligible = job.eligible_branches.some(
                    b => b.toLowerCase() === profile.branch.toLowerCase()
                );
                if (!isBranchEligible) {
                    reasons.push(`Branch '${profile.branch}' is not eligible (Eligible: ${job.eligible_branches.join(", ")}).`);
                }
            }
        }

        return {
            eligible: reasons.length === 0,
            reasons
        };
    };

    // Apply job form handler
    const handleApplySubmit = async (e) => {
        e.preventDefault();
        if (!resumeFile) {
            setApplyError("Please upload a PDF resume file.");
            return;
        }

        setIsApplying(true);
        setApplyError("");
        try {
            const formData = new FormData();
            formData.append("job", detailedJob.id);
            formData.append("resume_file", resumeFile);
            if (coverNote) {
                formData.append("cover_note", coverNote);
            }

            await api.applyJob(formData);
            setApplySuccess(true);
            
            // Reload applications to update states
            const appsRes = await api.getApplications();
            setApplications(appsRes.data.results || appsRes.data || []);
            
            setTimeout(() => {
                setIsApplyModalOpen(false);
                setApplySuccess(false);
                setResumeFile(null);
                setCoverNote("");
            }, 2500);
        } catch (err) {
            setApplyError(err.response?.data?.detail || "Failed to submit application. Try again.");
        } finally {
            setIsApplying(false);
        }
    };

    // Filter and sort jobs
    const filteredJobs = jobs.filter(job => {
        // Text search
        const matchSearch = 
            job.title?.toLowerCase().includes(search.toLowerCase()) ||
            job.company_name?.toLowerCase().includes(search.toLowerCase()) ||
            job.location?.toLowerCase().includes(search.toLowerCase());

        // Job type
        const matchType = jobTypeFilter === "All" || job.job_type === jobTypeFilter.toLowerCase().replace(" ", "_");

        // Work mode
        const matchMode = 
            workModeFilter === "All" || 
            (workModeFilter === "Remote" && job.is_remote) ||
            (workModeFilter === "On-site" && !job.is_remote);

        // Eligibility
        const eligibility = checkEligibility(job);
        const matchEligibility = eligibilityFilter === "All" || (eligibilityFilter === "Eligible Only" && eligibility.eligible);

        return matchSearch && matchType && matchMode && matchEligibility;
    }).sort((a, b) => {
        if (sortBy === "salary") {
            return (b.salary_max || 0) - (a.salary_max || 0);
        }
        if (sortBy === "match") {
            return (b.match_percent || 0) - (a.match_percent || 0);
        }
        // default: newest
        return new Date(b.created_at) - new Date(a.created_at);
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 text-sm mt-3 font-medium">Loading placement opportunities...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center max-w-md mx-auto mt-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                <i className="fa-solid fa-triangle-exclamation text-red-500 text-3xl mb-3"></i>
                <h3 className="font-semibold text-gray-900 text-lg">Error loading board</h3>
                <p className="text-gray-500 text-sm mt-1 mb-4">{error}</p>
                <button onClick={loadJobsAndProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
                    Try Again
                </button>
            </div>
        );
    }

    const selectedJob = detailedJob || filteredJobs.find(j => j.id === selectedJobId) || filteredJobs[0];
    const eligibility = checkEligibility(selectedJob);
    const application = selectedJob ? getApplicationForJob(selectedJob.id) : null;

    // Helper functions for parsing list-like fields safely
    const getSkillsList = (job) => {
        if (!job?.required_skills) return [];
        if (Array.isArray(job.required_skills)) return job.required_skills;
        if (typeof job.required_skills === 'string') {
            return job.required_skills.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
    };

    const getBenefitsList = (job) => {
        if (!job?.benefits) return [];
        if (Array.isArray(job.benefits)) return job.benefits;
        if (typeof job.benefits === 'string') {
            return job.benefits.split(',').map(b => b.trim()).filter(Boolean);
        }
        return [];
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto flex flex-col gap-6 min-h-screen">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Board</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Explore drives, check your placement eligibility, and apply to matching roles.</p>
                </div>
                {profile && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                            {profile.cgpa || "?"}
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-semibold text-blue-900">{profile.full_name}</div>
                            <div className="text-[10px] text-blue-600">{profile.branch || "No Branch"} • {profile.is_verified ? "Verified" : "Unverified"}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by job title, company, skills, or location..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="salary">Highest Salary</option>
                        <option value="match">Highest Match</option>
                    </select>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-2">Filters:</span>
                    
                    {/* Job Type Filter */}
                    <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50/50">
                        {["All", "Full Time", "Internship", "PPO"].map(type => (
                            <button
                                key={type}
                                onClick={() => setJobTypeFilter(type)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                    jobTypeFilter === type 
                                        ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Work Mode Filter */}
                    <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50/50">
                        {["All", "On-site", "Remote"].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setWorkModeFilter(mode)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                    workModeFilter === mode 
                                        ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* Eligibility Filter */}
                    <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50/50">
                        {["All", "Eligible Only"].map(elig => (
                            <button
                                key={elig}
                                onClick={() => setEligibilityFilter(elig)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                    eligibilityFilter === elig 
                                        ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {elig}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Workspace: Split Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: JobList */}
                <div className="lg:col-span-5 space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredJobs.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                            <i className="fa-regular fa-folder-open text-gray-300 text-3xl mb-2"></i>
                            <h4 className="font-semibold text-gray-800 text-sm">No Jobs Found</h4>
                            <p className="text-gray-500 text-xs mt-1">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                isSelected={selectedJobId === job.id}
                                onClick={() => setSelectedJobId(job.id)}
                                onSaveToggle={handleSaveToggle}
                            />
                        ))
                    )}
                </div>

                {/* Right Side: Sticky Detail Drawer */}
                <div className="lg:col-span-7 sticky top-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    {isDetailsLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-400 text-xs mt-3">Loading details...</p>
                        </div>
                    ) : !selectedJob ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center h-64">
                            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
                                <i className="fa-regular fa-hand-pointer text-xl animate-bounce"></i>
                            </div>
                            <h4 className="font-semibold text-gray-900 text-sm">Select a job</h4>
                            <p className="text-gray-500 text-xs mt-1">Click any card on the left to inspect eligibility requirements and apply.</p>
                        </div>
                    ) : (
                        <>
                            {/* Company Branding Details */}
                            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg border border-blue-700 shadow-sm">
                                        {selectedJob.company?.name ? selectedJob.company.name.charAt(0) : selectedJob.company_name?.charAt(0) || "J"}
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
                                        <div className="text-sm font-semibold text-blue-600 mt-0.5">{selectedJob.company?.name || selectedJob.company_name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                                            <i className="fa-solid fa-location-dot"></i> {selectedJob.location || (selectedJob.is_remote ? 'Remote' : 'On-site')}
                                            {selectedJob.is_remote && <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded text-[10px] border border-blue-100">Remote</span>}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleSaveToggle(selectedJob.id)}
                                    className={`p-2 rounded-xl border transition-colors ${
                                        selectedJob.is_saved 
                                            ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100/50' 
                                            : 'bg-white text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <i className={`${selectedJob.is_saved ? 'fa-solid' : 'fa-regular'} fa-bookmark text-lg`}></i>
                                </button>
                            </div>

                            {/* Eligibility Status Checklist */}
                            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Placement Eligibility Requirements</h3>
                                <div className="space-y-2.5">
                                    {/* Verification Status */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Profile Verification:</span>
                                        <div className="flex items-center gap-1.5 font-semibold">
                                            {profile?.is_verified ? (
                                                <span className="text-emerald-600 flex items-center gap-1"><i className="fa-solid fa-circle-check"></i> Verified</span>
                                            ) : (
                                                <span className="text-red-500 flex items-center gap-1"><i className="fa-solid fa-circle-xmark"></i> Unverified</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* CGPA requirement */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 font-medium">CGPA eligibility:</span>
                                        <div className="flex items-center gap-1.5 font-semibold">
                                            {profile?.cgpa >= selectedJob.min_cgpa ? (
                                                <span className="text-emerald-600 flex items-center gap-1"><i className="fa-solid fa-circle-check"></i> Eligible ({profile?.cgpa} / 10 &gt;= {selectedJob.min_cgpa})</span>
                                            ) : (
                                                <span className="text-red-500 flex items-center gap-1"><i className="fa-solid fa-circle-xmark"></i> Ineligible ({profile?.cgpa || "0"} / 10 &lt; {selectedJob.min_cgpa})</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Branch requirement */}
                                    {selectedJob.eligible_branches && selectedJob.eligible_branches.length > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 font-medium">Branch eligibility:</span>
                                            <div className="flex items-center gap-1.5 font-semibold">
                                                {selectedJob.eligible_branches.some(b => b.toLowerCase() === profile?.branch?.toLowerCase()) ? (
                                                    <span className="text-emerald-600 flex items-center gap-1"><i className="fa-solid fa-circle-check"></i> {profile?.branch} Branch eligible</span>
                                                ) : (
                                                    <span className="text-red-500 flex items-center gap-1"><i className="fa-solid fa-circle-xmark"></i> {profile?.branch || "N/A"} Branch ineligible</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {eligibility.reasons.length > 0 && (
                                    <div className="mt-3.5 pt-3 border-t border-gray-200 text-xs text-red-500 font-medium flex flex-col gap-1">
                                        <div className="font-bold flex items-center gap-1.5 mb-1"><i className="fa-solid fa-triangle-exclamation"></i> Eligibility warnings:</div>
                                        {eligibility.reasons.map((r, i) => (
                                            <div key={i} className="pl-5 relative before:content-['•'] before:absolute before:left-2">{r}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Job Description details */}
                            <div className="flex flex-col gap-4 text-left">
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-[15px]">Job Description</h3>
                                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                                </div>

                                {/* Skills */}
                                {getSkillsList(selectedJob).length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-[15px]">Required Skills</h3>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {getSkillsList(selectedJob).map((skill, index) => (
                                                <span key={index} className="bg-blue-50/50 text-blue-600 border border-blue-100 text-xs font-semibold px-2.5 py-1 rounded-md">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Benefits */}
                                {getBenefitsList(selectedJob).length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-[15px]">Benefits & Perks</h3>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {getBenefitsList(selectedJob).map((perk, index) => (
                                                <span key={index} className="bg-emerald-50/30 text-emerald-700 border border-emerald-100 text-xs font-semibold px-2.5 py-1 rounded-md">
                                                    {perk}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Deadline and metadata info */}
                                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500 mt-2">
                                    <div>
                                        <span className="font-medium">Application Deadline:</span>
                                        <div className="text-sm font-semibold text-gray-800 mt-0.5">
                                            {new Date(selectedJob.application_deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Employment Type:</span>
                                        <div className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">
                                            {selectedJob.job_type?.replace('_', ' ') || "Full Time"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer Apply Actions */}
                            <div className="border-t border-gray-100 pt-4">
                                {application ? (
                                    <div className="flex flex-col gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-left">
                                        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                                            <i className="fa-solid fa-circle-check text-emerald-600"></i> Applied Successfully
                                        </div>
                                        <div className="text-xs text-emerald-600 font-medium mt-0.5">
                                            Status: <span className="capitalize font-bold">{application.status?.replace('_', ' ')}</span> • Applied on {new Date(application.applied_at).toLocaleDateString('en-US')}
                                        </div>
                                    </div>
                                ) : !eligibility.eligible ? (
                                    <button
                                        disabled
                                        className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-lg text-sm border border-gray-200 cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <i className="fa-solid fa-ban"></i> Ineligible to Apply
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsApplyModalOpen(true)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                    >
                                        <i className="fa-solid fa-paper-plane"></i> Apply Now
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Apply Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-lg w-full p-6 text-left relative">
                        <button 
                            onClick={() => {
                                setIsApplyModalOpen(false);
                                setApplyError("");
                                setResumeFile(null);
                                setCoverNote("");
                            }}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 mb-1">Apply for Position</h2>
                        <p className="text-xs text-gray-500 mb-6">Position: <span className="font-semibold text-gray-800">{detailedJob?.title}</span> @ {detailedJob?.company?.name}</p>

                        {applySuccess ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                                    <i className="fa-solid fa-circle-check text-3xl"></i>
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">Application Submitted!</h3>
                                <p className="text-gray-500 text-xs mt-1">Your placement application was successfully dispatched. Checking status details...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleApplySubmit} className="space-y-4">
                                {applyError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                                        <i className="fa-solid fa-circle-xmark"></i> {applyError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Upload Resume (PDF)*</label>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50/50">
                                        <input 
                                            type="file"
                                            required
                                            accept=".pdf"
                                            onChange={(e) => setResumeFile(e.target.files[0])}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <i className="fa-regular fa-file-pdf text-gray-400 text-3xl mb-2"></i>
                                        <span className="text-xs font-semibold text-gray-700">
                                            {resumeFile ? resumeFile.name : "Click to select or drag PDF file"}
                                        </span>
                                        <span className="text-[10px] text-gray-400 mt-1">PDF file format only (Max 5MB)</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Cover Letter / Note (Optional)</label>
                                    <textarea
                                        rows={4}
                                        value={coverNote}
                                        onChange={(e) => setCoverNote(e.target.value)}
                                        placeholder="Briefly state your qualifications or why you are a fit for this placement role..."
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end border-t border-gray-100 pt-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsApplyModalOpen(false);
                                            setApplyError("");
                                            setResumeFile(null);
                                            setCoverNote("");
                                        }}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isApplying}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                                    >
                                        {isApplying ? "Submitting..." : "Submit Application"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

