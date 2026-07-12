import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import UserTable from "../components/UserTable";
import UserFormModal from "../components/UserFormModal";
import ViewUserModal from "../components/ViewUserModal";
import DeleteUserModal from "../components/DeleteUserModal";
import { api } from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    Promise.all([
      api.getStudents(),
      api.getCompanies()
    ])
    .then(([studentsRes, companiesRes]) => {
      const studentList = (studentsRes.data.results || studentsRes.data).map(s => ({
        id: s.id,
        name: s.full_name || "New Student",
        email: s.email,
        role: "Student",
        status: s.is_verified ? "Active" : "Inactive"
      }));

      const companyList = (companiesRes.data.results || companiesRes.data).map(c => ({
        id: c.id,
        name: c.name,
        email: c.website || "No Email",
        role: "Company",
        status: "Active"
      }));

      setUsers([...studentList, ...companyList]);
      setLoading(false)
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleSaveUser = (userData) => {
    const emailExists = users.some(
      (u) => u.email === userData.email && u.id !== editingUser?.id
    );

    if (emailExists) {
      alert("Email already exists");
      return;
    }

    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...userData, id: editingUser.id } : u)));
    } else {
      setUsers([...users, { ...userData, id: Date.now() }]);
    }

    setEditingUser(null);
    setIsFormOpen(false);
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
    setSelectedUser(null);
    setIsDeleteOpen(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = filterRole === "All" || u.role === filterRole;

    return matchSearch && matchRole;
  });

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 flex-1 bg-gray-100 min-h-screen">
        <Navbar />

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-gray-500">Manage students, companies and administrators.</p>
            </div>

            <button
              onClick={handleAddUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2"
            >
              <FaPlus />
              Add User
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-5 mb-6 flex justify-between">
            <input
              type="text"
              placeholder="Search user..."
              className="border rounded-lg px-4 py-2 w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="border rounded-lg px-4 py-2"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Student">Student</option>
              <option value="Company">Company</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <UserTable
            users={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteClick}
          />

          <UserFormModal
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingUser(null);
            }}
            onSave={handleSaveUser}
            editingUser={editingUser}
          />

          <ViewUserModal
            isOpen={isViewOpen}
            onClose={() => setIsViewOpen(false)}
            user={selectedUser}
          />

          <DeleteUserModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDeleteUser}
            user={selectedUser}
          />
        </div>
      </div>
    </div>
  );
}
