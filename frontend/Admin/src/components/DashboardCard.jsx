import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div>
      <Sidebar />

      <div className="ml-64 p-10">
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome Admin 👋
        </p>
      </div>
    </div>
  );
}