import React, { useState, useEffect } from "react";

const initialState = {
  title: "",
  companyId: "",
  job_type: "full_time",
  location: "",
  salary_min: "",
  salary_max: "",
  application_deadline: "",
  is_active: true,
  description: "",
};

export default function JobFormModal({
  isOpen,
  onClose,
  onSave,
  editingJob,
  companies = [],
  isSaving,
  formError,
}) {
  const [formData, setFormData] = useState(initialState);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title || "",
        companyId: editingJob.companyId || "",
        job_type: editingJob.job_type || "full_time",
        location: editingJob.location || "",
        salary_min: editingJob.salary_min ?? "",
        salary_max: editingJob.salary_max ?? "",
        application_deadline: editingJob.application_deadline || "",
        is_active: editingJob.is_active !== undefined ? editingJob.is_active : true,
        description: editingJob.description || "",
      });
    } else {
      setFormData(initialState);
    }
    setLocalError("");
  }, [editingJob, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setLocalError("Job role/title is required.");
      return;
    }
    if (!formData.companyId) {
      setLocalError("Please select a company.");
      return;
    }
    if (!formData.application_deadline) {
      setLocalError("Application deadline is required.");
      return;
    }

    setLocalError("");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        <div className="bg-blue-600 text-white px-6 py-4 shrink-0">
          <h2 className="text-2xl font-normal">{editingJob ? "Edit Job Posting" : "Add Job Posting"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-normal text-gray-700">Job Role *</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-normal text-gray-700">Company *</label>
                <select
                  required
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500"
                >
                  <option value="">Select a company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {companies.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No companies found — add a company first.
                  </p>
                )}
              </div>

              <div>
                <label className="font-normal text-gray-700">Job Type</label>
                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500"
                >
                  <option value="full_time">Full Time</option>
                  <option value="internship">Internship</option>
                  <option value="ppo">PPO</option>
                </select>
              </div>

              <div>
                <label className="font-normal text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-normal text-gray-700">Min Salary (₹)</label>
                <input
                  type="number"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-normal text-gray-700">Max Salary (₹)</label>
                <input
                  type="number"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-normal text-gray-700">Application Deadline *</label>
                <input
                  required
                  type="date"
                  name="application_deadline"
                  value={formData.application_deadline}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 mt-8">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <label htmlFor="is_active" className="font-normal text-gray-700">
                  Active (visible to students)
                </label>
              </div>
            </div>

            <div className="mt-5">
              <label className="font-normal text-gray-700">Description / Notes</label>
              <textarea
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal resize-none outline-none focus:border-blue-500"
              />
            </div>

            {(formError || localError) && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {localError || formError}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-normal rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 text-white font-normal rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
