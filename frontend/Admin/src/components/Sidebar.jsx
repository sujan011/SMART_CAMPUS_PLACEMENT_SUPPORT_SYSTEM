import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaBriefcase,
  FaChartBar,
  FaBell,
  FaCog
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <FaHome />
    },
    {
      name: "Users",
      path: "/users",
      icon: <FaUsers />
    },
    {
      name: "Companies",
      path: "/companies",
      icon: <FaBuilding />
    },
    {
      name: "Jobs",
      path: "/jobs",
      icon: <FaBriefcase />
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <FaChartBar />
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <FaBell />
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <FaCog />
    }
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0">

      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">
          Placement Admin
        </h1>
      </div>

      <nav className="mt-4">

        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 transition
              ${
                isActive
                  ? "bg-blue-600"
                  : "hover:bg-slate-800"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}

      </nav>
    </div>
  );
}