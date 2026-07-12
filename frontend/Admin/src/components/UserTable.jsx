import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function UserTable({
  users,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-blue-600 text-white">

          <tr>

            <th className="p-4 text-left">Name</th>

            <th className="p-4 text-left">Email</th>

            <th className="p-4 text-left">Role</th>

            <th className="p-4 text-left">Status</th>

            <th className="p-4 text-center">Action</th>

          </tr>

        </thead>

        <tbody>

          {users.length === 0 ? (
            <tr>

              <td
                colSpan="5"
                className="text-center py-6 text-gray-500"
              >
                No Users Found
              </td>

            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">{user.name}</td>

                <td className="p-4">{user.email}</td>

                <td className="p-4">{user.role}</td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status}
                  </span>

                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-5">

                    <button
                      onClick={() => onView(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye />
                    </button>

                    <button
                      onClick={() => onEdit(user)}
                      className="text-yellow-500 hover:text-yellow-700"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => onDelete(user)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>

                  </div>

                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}