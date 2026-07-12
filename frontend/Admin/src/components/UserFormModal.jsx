import { useState, useEffect } from "react";

export default function UserFormModal({
  isOpen,
  onClose,
  onSave,
  editingUser,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Student",
    status: "Active",
  });

  useEffect(() => {
    if (editingUser) {
      setFormData(editingUser);
    } else {
      setFormData({
        name: "",
        email: "",
        role: "Student",
        status: "Active",
      });
    }
  }, [editingUser]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert("Please fill all fields.");
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[450px] rounded-xl shadow-lg p-6">

        <h2 className="text-2xl font-bold mb-6">
          {editingUser ? "Edit User" : "Add User"}
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Name */}

          <div className="mb-4">

            <label className="block mb-2 font-medium">
              Name
            </label>

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
            />

          </div>

          {/* Email */}

          <div className="mb-4">

            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
            />

          </div>

          {/* Role */}

          <div className="mb-4">

            <label className="block mb-2 font-medium">
              Role
            </label>

            <select
              className="w-full border rounded-lg px-3 py-2"
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value,
                })
              }
            >
              <option>Student</option>
              <option>Admin</option>
              <option>Company</option>
            </select>

          </div>

          {/* Status */}

          <div className="mb-6">

            <label className="block mb-2 font-medium">
              Status
            </label>

            <select
              className="w-full border rounded-lg px-3 py-2"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value,
                })
              }
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>

          </div>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingUser ? "Update" : "Save"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}