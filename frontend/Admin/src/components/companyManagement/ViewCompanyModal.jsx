import {
  FaBuilding,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaIndustry,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendarAlt,
} from "react-icons/fa";

export default function ViewCompanyModal({
  isOpen,
  onClose,
  company,
}) {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      
      {/* 1. Modal Container: constrained by max-h-[90vh] and flex-col */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header - shrink-0 prevents it from squishing */}
        <div className="bg-blue-600 text-white p-5 shrink-0 flex justify-between items-center">
          <h2 className="text-2xl font-normal">
            Company Details
          </h2>
          <button
            onClick={onClose}
            className="text-3xl hover:text-gray-200 leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body - overflow-y-auto makes this specific section scrollable */}
        <div className="p-8 overflow-y-auto flex-1">
          
          {/* Company Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center border-4 border-white shadow-sm">
              <FaBuilding
                size={40}
                className="text-blue-600"
              />
            </div>
          </div>

          {/* Company Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Info
              icon={<FaBuilding />}
              label="Company"
              value={company.companyName}
            />
            <Info
              icon={<FaUserTie />}
              label="HR Name"
              value={company.hrName}
            />
            <Info
              icon={<FaEnvelope />}
              label="Email"
              value={company.email}
            />
            <Info
              icon={<FaPhone />}
              label="Phone"
              value={company.phone}
            />
            <Info
              icon={<FaGlobe />}
              label="Website"
              value={company.website}
            />
            <Info
              icon={<FaIndustry />}
              label="Industry"
              value={company.industry}
            />
            <Info
              icon={<FaBriefcase />}
              label="Total Jobs"
              value={company.totalJobs}
            />
            <Info
              icon={<FaCalendarAlt />}
              label="Registered"
              value={company.registeredDate}
            />
          </div>

          {/* Address */}
          <div className="mt-8">
            <h3 className="font-normal text-lg flex items-center gap-2 text-gray-900">
              <FaMapMarkerAlt className="text-blue-600" />
              Address
            </h3>
            <p className="mt-2 text-gray-600 font-normal">
              {company.address}
            </p>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h3 className="font-normal text-lg text-gray-900">
              Company Description
            </h3>
            <p className="mt-2 text-gray-600 leading-7 font-normal">
              {company.description}
            </p>
          </div>
        </div>

        {/* Footer - shrink-0 keeps it pinned to the bottom */}
        <div className="border-t border-gray-100 p-5 flex justify-end shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-normal transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

// Info Component Helper
function Info({ icon, label, value }) {
  return (
    <div className="bg-[#f8fafc] rounded-xl p-4 border border-gray-100">
      <h4 className="text-sm text-gray-500 flex items-center gap-2 font-normal">
        <span className="text-blue-600">
          {icon}
        </span>
        {label}
      </h4>
      <p className="mt-2 text-lg text-gray-900 font-normal break-words">
        {value || "-"}
      </p>
    </div>
  );
}