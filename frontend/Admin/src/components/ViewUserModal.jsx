import { FaTimes } from "react-icons/fa";

export default function ViewUserModal({
  isOpen,
  onClose,
  user,
}) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[450px] rounded-xl shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-center border-b p-5">

          <h2 className="text-2xl font-bold">
            User Details
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600"
          >
            <FaTimes size={20} />
          </button>

        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          <div>
            <label className="font-semibold text-gray-600">
              Name
            </label>

            <p className="mt-1 text-lg">
              {user.name}
            </p>
          </div>

          <div>
            <label className="font-semibold text-gray-600">
              Email
            </label>

            <p className="mt-1 text-lg">
              {user.email}
            </p>
          </div>

          <div>
            <label className="font-semibold text-gray-600">
              Role
            </label>

            <p className="mt-1 text-lg">
              {user.role}
            </p>
          </div>

          <div>
            <label className="font-semibold text-gray-600">
              Status
            </label>

            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                user.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.status}
            </span>

          </div>

        </div>

        {/* Footer */}
        <div className="border-t p-5 flex justify-end">

          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}