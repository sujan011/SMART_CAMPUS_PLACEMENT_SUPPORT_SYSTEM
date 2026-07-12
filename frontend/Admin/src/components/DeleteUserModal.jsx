import { FaTrash, FaTimes } from "react-icons/fa";

export default function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  user,
}) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-lg w-[400px]">

        {/* Header */}
        <div className="flex justify-between items-center border-b p-5">

          <h2 className="text-2xl font-bold text-red-600">
            Delete User
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600"
          >
            <FaTimes />
          </button>

        </div>

        {/* Body */}
        <div className="p-6">

          <div className="flex justify-center mb-5">

            <div className="bg-red-100 p-5 rounded-full">

              <FaTrash className="text-red-600 text-4xl" />

            </div>

          </div>

          <p className="text-center text-lg">

            Are you sure you want to delete

            <span className="font-bold">
              {" "}{user.name}
            </span>

            ?

          </p>

          <p className="text-center text-gray-500 mt-2">
            This action cannot be undone.
          </p>

        </div>

        {/* Footer */}

        <div className="border-t p-5 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(user.id)}
            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}