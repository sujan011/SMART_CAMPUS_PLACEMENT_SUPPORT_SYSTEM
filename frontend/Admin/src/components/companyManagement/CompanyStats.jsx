import {
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";

export default function CompanyStats({ companies }) {
  const totalCompanies = companies.length;

  const approvedCompanies = companies.filter(
    (company) => company.status === "Approved"
  ).length;

  const pendingCompanies = companies.filter(
    (company) => company.status === "Pending"
  ).length;

  const rejectedCompanies = companies.filter(
    (company) => company.status === "Rejected"
  ).length;

  const stats = [
    {
      title: "Total Companies",
      value: totalCompanies,
      icon: <FaBuilding size={28} />,
      bg: "bg-blue-500",
    },
    {
      title: "Approved",
      value: approvedCompanies,
      icon: <FaCheckCircle size={28} />,
      bg: "bg-green-500",
    },
    {
      title: "Pending",
      value: pendingCompanies,
      icon: <FaClock size={28} />,
      bg: "bg-yellow-500",
    },
    {
      title: "Rejected",
      value: rejectedCompanies,
      icon: <FaTimesCircle size={28} />,
      bg: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300"
        >
          <div className="flex justify-between items-center">

            <div>
              <h4 className="text-gray-500 font-medium">
                {stat.title}
              </h4>

              <h2 className="text-3xl font-bold mt-2">
                {stat.value}
              </h2>
            </div>

            <div
              className={`${stat.bg} text-white p-4 rounded-full`}
            >
              {stat.icon}
            </div>

          </div>
        </div>
      ))}

    </div>
  );
}