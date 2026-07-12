import {
  FaEye,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaBuilding,
} from "react-icons/fa";

export default function CompanyTable({
  companies,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">

      <div className="overflow-x-auto">

        <table className="w-full">

          {/* Table Header */}

          <thead className="bg-blue-600 text-white">

            <tr>

              <th className="px-5 py-4 text-left">Logo</th>

              <th className="px-5 py-4 text-left">Company</th>

              <th className="px-5 py-4 text-left">HR Name</th>

              <th className="px-5 py-4 text-left">Email</th>

              <th className="px-5 py-4 text-left">Phone</th>

              <th className="px-5 py-4 text-left">Industry</th>

              <th className="px-5 py-4 text-center">Jobs</th>

              <th className="px-5 py-4 text-center">Status</th>

              <th className="px-5 py-4 text-center">
                Registered
              </th>

              <th className="px-5 py-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          {/* Table Body */}

          <tbody>

            {companies.length === 0 ? (

              <tr>

                <td
                  colSpan="10"
                  className="text-center py-12 text-gray-500 text-lg"
                >
                  No Companies Found
                </td>

              </tr>

            ) : (

              companies.map((company) => (

                <tr
                  key={company.id}
                  className="border-b hover:bg-gray-50 transition"
                >

                  {/* Logo */}

                  <td className="px-5 py-4">

                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">

                      <FaBuilding
                        className="text-blue-600"
                        size={22}
                      />

                    </div>

                  </td>

                  {/* Company */}

                  <td className="px-5 py-4 font-semibold">

                    {company.companyName}

                  </td>

                  {/* HR */}

                  <td className="px-5 py-4">

                    {company.hrName}

                  </td>

                  {/* Email */}

                  <td className="px-5 py-4">

                    {company.email}

                  </td>

                  {/* Phone */}

                  <td className="px-5 py-4">

                    {company.phone}

                  </td>

                  {/* Industry */}

                  <td className="px-5 py-4">

                    {company.industry}

                  </td>

                  {/* Jobs */}

                  <td className="px-5 py-4 text-center">

                    {company.totalJobs}

                  </td>

                  {/* Status */}

                  <td className="px-5 py-4 text-center">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold
                      ${
                        company.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : company.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {company.status}
                    </span>

                  </td>

                  {/* Registered Date */}

                  <td className="px-5 py-4 text-center">

                    {company.registeredDate}

                  </td>

                  {/* Actions */}

                  <td className="px-5 py-4">

                    <div className="flex justify-center gap-3">

                      {/* View */}

                      <button
                        onClick={() => onView(company)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View"
                      >
                        <FaEye />
                      </button>

                      {/* Edit */}

                      <button
                        onClick={() => onEdit(company)}
                        className="text-yellow-600 hover:text-yellow-700"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>

                      {/* Delete */}

                      <button
                        onClick={() => onDelete(company)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>

                      {/* Approve */}

                      <button
                        className="text-green-600 hover:text-green-700"
                        title="Approve"
                      >
                        <FaCheck />
                      </button>

                      {/* Reject */}

                      <button
                        className="text-red-500 hover:text-red-700"
                        title="Reject"
                      >
                        <FaTimes />
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}