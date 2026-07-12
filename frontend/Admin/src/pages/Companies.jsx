import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import CompanyStats from "../components/companyManagement/CompanyStats";
import CompanySearch from "../components/companyManagement/CompanySearch";
import CompanyFilter from "../components/companyManagement/CompanyFilter";
import CompanyTable from "../components/companyManagement/CompanyTable";
import CompanyFormModal from "../components/companyManagement/CompanyFormModal";
import ViewCompanyModal from "../components/companyManagement/ViewCompanyModal";
import DeleteCompanyModal from "../components/companyManagement/DeleteCompanyModal";
import { api } from "../services/api";

export default function Companies() {
  const [companies, setCompanies] = useState([]);

  const fetchCompanies = () => {
    api.getCompanies()
      .then(res => {
        const list = res.data.results || res.data;
        const mapped = list.map(c => ({
          id: c.id,
          companyName: c.name,
          hrName: "Verified HR",
          email: c.website || "No Website",
          phone: c.company_size ? `${c.company_size} Employees` : "N/A",
          website: c.website || "#",
          industry: c.industry || "IT",
          address: c.headquarters || "N/A",
          description: c.description || "",
          totalJobs: c.open_jobs_count || 0,
          status: "Approved",
          registeredDate: new Date(c.created_at).toLocaleDateString()
        }));
        setCompanies(mapped);
      })
      .catch(err => console.error("Failed to fetch companies list", err));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const filteredCompanies = companies.filter((company) => {
    const matchSearch =
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.hrName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchIndustry =
      industryFilter === "All" || company.industry === industryFilter;

    const matchStatus =
      statusFilter === "All" || company.status === statusFilter;

    return matchSearch && matchIndustry && matchStatus;
  });

  const handleAddCompany = () => {
    setEditingCompany(null);
    setIsFormOpen(true);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  const handleView = (company) => {
    setSelectedCompany(company);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (company) => {
    setSelectedCompany(company);
    setIsDeleteOpen(true);
  };

  const handleSaveCompany = (companyData) => {
    if (editingCompany) {
      setCompanies(
        companies.map((company) =>
          company.id === editingCompany.id
            ? { ...companyData, id: editingCompany.id }
            : company
        )
      );
    } else {
      setCompanies([
        ...companies,
        {
          ...companyData,
          id: Date.now(),
          registeredDate: new Date().toLocaleDateString(),
        },
      ]);
    }
    setIsFormOpen(false);
    setEditingCompany(null);
  };

  const handleDeleteCompany = (id) => {
    setCompanies(companies.filter((company) => company.id !== id));
    setIsDeleteOpen(false);
  };

  return (
    // 1. h-screen and overflow-hidden prevent the whole page from scrolling
    <div className="flex h-screen overflow-hidden bg-[#f4f7f6] font-sans font-normal text-gray-900">
      
      <Sidebar />

      {/* 2. min-w-0 ensures flex children don't overflow the screen width */}
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        
        {/* Navbar area - shrink-0 prevents it from getting crushed */}
        <div className="shrink-0">
          <Navbar />
        </div>

        {/* 3. Main Content Area - takes remaining height, manages internal layout */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden max-w-screen-2xl mx-auto w-full">
          
          {/* Stats Component Container */}
          <div className="shrink-0">
            <CompanyStats companies={companies} />
          </div>

          {/* Search & Filter Toolbar Container */}
          <div className="flex justify-between items-center shrink-0">
            <CompanySearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <CompanyFilter
              industryFilter={industryFilter}
              setIndustryFilter={setIndustryFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onAddCompany={handleAddCompany}
            />
          </div>

          {/* 4. Table Container - Flex-1 pushes it to fill the bottom, overflow-hidden keeps it strictly inside */}
          <div className="flex-1 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
            <CompanyTable
              companies={filteredCompanies}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </div>

        </div>
      </div>

      {/* Modals remain completely unchanged */}
      <CompanyFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCompany}
        editingCompany={editingCompany}
      />

      <ViewCompanyModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        company={selectedCompany}
      />

      <DeleteCompanyModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        company={selectedCompany}
        onConfirm={handleDeleteCompany}
      />
    </div>
  );
}