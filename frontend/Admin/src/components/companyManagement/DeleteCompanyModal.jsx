import { FaTrashAlt } from "react-icons/fa";

export default function DeleteCompanyModal({
  isOpen,
  onClose,
  onConfirm,
  company,
}) {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl shadow-xl w-[430px]">

        {/* Header */}

        <div className="bg-red-600 text-white p-5 rounded-t-xl flex items-center gap-3">

          <FaTrashAlt size={28} />

          <h2 className="text-2xl font-bold">

            Delete Company

          </h2>

        </div>

        {/* Body */}

        <div className="p-6">

          <p className="text-lg">

            Are you sure you want to delete

            <span className="font-bold text-red-600">

              {" "}{company.companyName}

            </span>

            ?

          </p>

          <p className="mt-4 text-gray-500">

            This action cannot be undone.

          </p>

        </div>

        {/* Footer */}

        <div className="border-t p-5 flex justify-end gap-4">

          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(company.id)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}