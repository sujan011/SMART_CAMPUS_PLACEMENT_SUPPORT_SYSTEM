import { FaBell, FaUserCircle, FaSearch } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");

    navigate("/login");
  };

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path.startsWith("/users")) return "Users";
    if (path.startsWith("/companies")) return "Companies";
    if (path.startsWith("/jobs")) return "Jobs";
    if (path.startsWith("/analytics")) return "Analytics";
    if (path.startsWith("/notifications")) return "Notifications";
    if (path.startsWith("/settings")) return "Settings";
    return "Placement Admin";
  };

  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-8">

      <h2 className="text-2xl font-bold">{getHeaderTitle()}</h2>

      <div className="relative">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />

        <input
          type="text"
          placeholder="Search..."
          className="pl-10 py-2 border rounded-lg"
        />
      </div>

      <div className="flex items-center gap-6">

        <FaBell className="text-2xl" />

        <div className="flex items-center gap-2">

          <FaUserCircle className="text-4xl text-blue-600" />

          <div>
            <h4>{currentUser?.name}</h4>
            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>

      </div>

    </header>
  );
}