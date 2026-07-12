import { FaSearch } from "react-icons/fa";

export default function CompanySearch({
  searchTerm,
  setSearchTerm,
}) {
  return (
    <div className="relative w-full max-w-md">

      <FaSearch
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        placeholder="Search Company, HR Name or Email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:border-blue-500 bg-white"
      />

    </div>
  );
}