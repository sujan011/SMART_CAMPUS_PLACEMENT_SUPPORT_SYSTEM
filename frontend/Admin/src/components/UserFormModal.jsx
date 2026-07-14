import { useState, useEffect } from "react";

export default function UserFormModal({
  isOpen,
  onClose,
  onSave,
  editingUser,
  isSaving,
  formError,
}) {
  const [status, setStatus] = useState("Active");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (editingUser) {
      setStatus(editingUser.status || "Active");
      setName(editingUser.name || "");
      setEmail(editingUser.email || "");
    }
  }, [editingUser]);

  if (!isOpen) return null;

  // There is no backend endpoint to create an arbitrary account (student, company,
  // or admin) from this screen -- students register themselves via the sign-up
  // flow and companies are created on the Companies page. Rather than fake a save,
  // we tell the admin exactly what to do instead.
  if (!editingUser) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[450px] rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Add User</h2>
          <p className="text-gray-600 mb-6">
            New users aren't created from this screen. Students sign up
            through the Student Portal registration page, and companies are
            added from the <span className="font-medium">Companies</span>{" "}
            page. Once created, they'll show up here.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ status, name, email });
  };

  const isStudent = editingUser._type === "student";
  const isCompany = editingUser._type === "company";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[450px] rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Edit {editingUser.role}</h2>
        <p className="text-sm text-gray-500 mb-6">
          {isStudent
            ? "You can activate/deactivate this student's account. Name, email, and role are managed by the student themselves."
            : "You can update this company's name and website."}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Name</label>
            <input
              type="text"
              disabled={isStudent}
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">
              {isCompany ? "Website" : "Email"}
            </label>
            <input
              type={isCompany ? "text" : "email"}
              disabled={isStudent}
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Role</label>
            <input
              type="text"
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
              value={editingUser.role}
            />
          </div>

          {isStudent && (
            <div className="mb-6">
              <label className="block mb-2 font-medium">Status</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Inactive students can no longer log in.
              </p>
            </div>
          )}

          {formError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {formError}
            </div>
          )}

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
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
