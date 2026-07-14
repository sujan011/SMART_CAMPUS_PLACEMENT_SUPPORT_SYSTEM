import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// Importing the extracted modular components
import JobStats from "../components/jobManagement/JobStats";
import JobSearch from "../components/jobManagement/JobSearch";
import JobFilter from "../components/jobManagement/JobFilter";
import JobTable from "../components/jobManagement/JobTable";
import JobFormModal from "../components/jobManagement/JobFormModal";
import ViewJobModal from "../components/jobManagement/ViewJobModal";
import DeleteJobModal from "../components/jobManagement/DeleteJobModal";
import { api } from "../services/api";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]); // for the company dropdown in the form
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchJobs = () => {
    return api.getJobs()
      .then(res => {
        const list = res.data.results || res.data;
        const mapped = list.map(j => ({
          id: j.id,
          // Real backend fields (used by the Add/Edit form -> sent back to Django)
          // Note: the jobs list endpoint returns company_name, not the raw company id,
          // so the id is resolved by matching company_name against the companies list
          // when the Edit form is opened (see handleEdit below).
          title: j.title,
          job_type: j.job_type || "full_time",
          location: j.location || "",
          salary_min: j.salary_min ?? "",
          salary_max: j.salary_max ?? "",
          application_deadline: j.application_deadline
            ? j.application_deadline.slice(0, 10)
            : "",
          is_active: j.is_active !== undefined ? j.is_active : true,
          description: j.description || "",
          // Cosmetic/display-only fields for the existing table/stats UI
          studentName: j.company_name || "Company Drive",
          company: j.company_name || "N/A",
          package: j.salary_max
            ? `${j.salary_min / 100000} - ${j.salary_max / 100000} LPA`
            : "Not Disclosed",
          status: j.is_active ? "Approved" : "Rejected",
          statusColor: j.is_active
            ? "text-green-700 bg-green-100"
            : "text-red-700 bg-red-100",
          date: new Date(j.created_at).toLocaleDateString(),
        }));
        setJobs(mapped);
      })
      .catch(err => console.error("Failed to fetch jobs list", err));
  };

  const fetchCompanies = () => {
    api.getCompanies()
      .then(res => {
        const list = res.data.results || res.data;
        setCompanies(list.map(c => ({ id: c.id, name: c.name })));
      })
      .catch(err => console.error("Failed to fetch companies for job form", err));
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal Visibility States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Selected Data States
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  // Status Handlers -- Job model only has a boolean `is_active`, so
  // Approve -> is_active: true, Reject -> is_active: false
  const handleApprove = async (id) => {
    try {
      await api.updateJob(id, { is_active: true });
      await fetchJobs();
    } catch (err) {
      console.error("Failed to approve job", err.response?.data || err);
      alert("Failed to approve job.");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.updateJob(id, { is_active: false });
      await fetchJobs();
    } catch (err) {
      console.error("Failed to reject job", err.response?.data || err);
      alert("Failed to reject job.");
    }
  };

  // Modal Handlers
  const handleView = (job) => { 
    setSelectedJob(job); 
    setIsViewOpen(true); 
  };
  
  const handleEdit = (job) => {
    // Resolve the company id by matching the display name, since the jobs
    // list endpoint only returns company_name, not the raw id.
    const matchedCompany = companies.find((c) => c.name === job.company);
    setEditingJob({
      ...job,
      companyId: matchedCompany ? matchedCompany.id : "",
    });
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (job) => { 
    setSelectedJob(job); 
    setIsDeleteOpen(true); 
  };

  const handleAddClick = () => { 
    setEditingJob(null); 
    setIsFormOpen(true); 
  };
  
  // Save/Delete Handlers
  const handleSaveJob = async (jobData) => {
    setFormError("");

    const payload = {
      title: jobData.title,
      company: jobData.companyId,
      job_type: jobData.job_type,
      location: jobData.location,
      salary_min: jobData.salary_min || null,
      salary_max: jobData.salary_max || null,
      application_deadline: jobData.application_deadline
        ? `${jobData.application_deadline}T23:59:00Z`
        : null,
      description: jobData.description,
      is_active: jobData.is_active,
    };

    setIsSaving(true);
    try {
      if (editingJob) {
        await api.updateJob(editingJob.id, payload);
      } else {
        await api.createJob(payload);
      }
      await fetchJobs();
      setIsFormOpen(false);
      setEditingJob(null);
    } catch (err) {
      console.error("Failed to save job", err.response?.data || err);
      setFormError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Failed to save job. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async (id) => {
    try {
      await api.deleteJob(id);
      await fetchJobs();
    } catch (err) {
      console.error("Failed to delete job", err.response?.data || err);
      alert("Failed to delete job.");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  // Filter Logic
  const filteredJobs = jobs.filter((job) => {
    const matchSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || job.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f6] font-sans font-normal text-gray-900">
      
      <Sidebar />

      <div className="ml-64 flex-1 flex flex-col min-w-0">
        
        <div className="shrink-0">
          <Navbar />
        </div>

        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden max-w-screen-2xl mx-auto w-full">
          
          <JobStats jobs={jobs} />

          <div className="flex gap-3 shrink-0">
            <JobSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <JobFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} onAddJob={handleAddClick} />
          </div>

          <JobTable 
            jobs={filteredJobs} 
            onView={handleView} 
            onEdit={handleEdit} 
            onDelete={handleDeleteClick} 
            onApprove={handleApprove} 
            onReject={handleReject} 
          />
          
        </div>
      </div>

      {/* Render Modals */}
      <JobFormModal 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setFormError("");
        }}
        onSave={handleSaveJob} 
        editingJob={editingJob}
        companies={companies}
        isSaving={isSaving}
        formError={formError}
      />
      <ViewJobModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        job={selectedJob} 
      />
      <DeleteJobModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        job={selectedJob} 
        onConfirm={handleConfirmDelete} 
      />

    </div>
  );
}