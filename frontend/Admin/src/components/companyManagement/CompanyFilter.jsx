import { FaPlus } from "react-icons/fa";

export default function CompanyFilter({
  industryFilter,
  setIndustryFilter,
  statusFilter,
  setStatusFilter,
  onAddCompany,
}) {
  return (
    <div className="flex items-center gap-4">

      {/* Industry Filter */}

      <select
        value={industryFilter}
        onChange={(e) => setIndustryFilter(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-3
        focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="All">All Industries</option>
        <option value="IT">IT</option>
        <option value="Finance">Finance</option>
        <option value="Banking">Banking</option>
        <option value="Healthcare">Healthcare</option>
        <option value="Manufacturing">Manufacturing</option>
        <option value="Education">Education</option>
        <option value="Others">Others</option>
      </select>

      {/* Status Filter */}

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-3
        focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="All">All Status</option>
        <option value="Approved">Approved</option>
        <option value="Pending">Pending</option>
        <option value="Rejected">Rejected</option>
      </select>

      {/* Add Company Button */}

      <button
        onClick={onAddCompany}
        className="bg-blue-600 hover:bg-blue-700 text-white
        px-5 py-3 rounded-lg flex items-center gap-2
        transition duration-300"
      >
        <FaPlus />

        Add Company
      </button>

    </div>
  );
}