import { useState, useEffect } from "react";

const initialState = {
  name: "",
  website: "",
  industry: "IT",
  headquarters: "",
  company_size: "",
  description: "",
};

export default function CompanyFormModal({
  isOpen,
  onClose,
  onSave,
  editingCompany,
  isSaving,
  formError,
}) {
  const [formData, setFormData] = useState(initialState);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (editingCompany) {
      setFormData({
        name: editingCompany.name || "",
        website: editingCompany.website || "",
        industry: editingCompany.industry || "IT",
        headquarters: editingCompany.headquarters || "",
        company_size: editingCompany.company_size || "",
        description: editingCompany.description || "",
      });
    } else {
      setFormData(initialState);
    }
    setLocalError("");
  }, [editingCompany, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setLocalError("Company name is required.");
      return;
    }

    setLocalError("");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      {/* 1. Added max-h-[90vh], flex-col, and overflow-hidden to constrain the modal height */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header - shrink-0 keeps it from compressing */}
        <div className="bg-blue-600 text-white px-6 py-4 shrink-0">
          <h2 className="text-2xl font-normal">
            {editingCompany ? "Edit Company" : "Add Company"}
          </h2>
        </div>

        {/* 2. Form acts as a flex container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* 3. Scrollable Body Area */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div>
                <label className="font-normal text-gray-700">Company Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full mt-2 border rounded-lg p-3 font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-normal text-gray-700">Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full mt-2 border rounded-lg p-3 font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-normal text-gray-700">Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full mt-2 border rounded-lg p-3 font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option>IT</option>
                  <option>Finance</option>
                  <option>Banking</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                  <option>Education</option>
                  <option>Others</option>
                </select>
              </div>

              <div>
                <label className="font-normal text-gray-700">Company Size</label>
                <input
                  type="text"
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  placeholder="e.g. 51-200 employees"
                  className="w-full mt-2 border rounded-lg p-3 font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="font-normal text-gray-700">Headquarters</label>
              <input
                type="text"
                name="headquarters"
                value={formData.headquarters}
                onChange={handleChange}
                className="w-full mt-2 border rounded-lg p-3 font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {(formError || localError) && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {localError || formError}
              </div>
            )}

            <div className="mt-5">
              <label className="font-normal text-gray-700">Company Description</label>
              <textarea
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full mt-2 border rounded-lg p-3 resize-none font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 4. Fixed Footer - Pinned to the bottom of the modal */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-normal rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 text-white font-normal rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving
                ? "Saving..."
                : editingCompany
                ? "Update Company"
                : "Add Company"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}