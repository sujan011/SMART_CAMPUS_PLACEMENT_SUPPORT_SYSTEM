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

  const fetchJobs = () => {
    api.getJobs()
      .then(res => {
        const list = res.data.results || res.data;
        const mapped = list.map(j => ({
          id: j.id,
          studentName: j.company_name || "Company Drive",
          title: j.title,
          company: j.company_name || "N/A",
          location: j.location || "N/A",
          package: j.salary_max ? `${j.salary_min / 100000} - ${j.salary_max / 100000} LPA` : "Not Disclosed",
          status: "Approved",
          statusColor: "text-green-700 bg-green-100",
          date: new Date(j.created_at).toLocaleDateString(),
          description: j.description || ""
        }));
        setJobs(mapped);
      })
      .catch(err => console.error("Failed to fetch jobs list", err));
  };

  useEffect(() => {
    fetchJobs();
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

  // Status Handlers
  const handleApprove = (id) => {
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, status: "Approved", statusColor: "text-green-700 bg-green-100" } : job
    ));
  };

  const handleReject = (id) => {
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, status: "Rejected", statusColor: "text-red-700 bg-red-100" } : job
    ));
  };

  // Modal Handlers
  const handleView = (job) => { 
    setSelectedJob(job); 
    setIsViewOpen(true); 
  };
  
  const handleEdit = (job) => { 
    setEditingJob(job); 
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
  const handleSaveJob = (jobData) => {
    const colorMap = {
      "Pending": "text-yellow-700 bg-yellow-100",
      "Approved": "text-green-700 bg-green-100",
      "Rejected": "text-red-700 bg-red-100"
    };
    
    if (editingJob) {
      setJobs(jobs.map(job => 
        job.id === editingJob.id ? { ...jobData, id: editingJob.id, statusColor: colorMap[jobData.status] } : job
      ));
    } else {
      setJobs([
        { ...jobData, id: Date.now(), date: new Date().toLocaleDateString(), statusColor: colorMap[jobData.status] }, 
        ...jobs
      ]);
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
    setIsDeleteOpen(false);
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
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveJob} 
        editingJob={editingJob} 
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