import React, { useState, useEffect } from "react";

export default function JobFormModal({ isOpen, onClose, onSave, editingJob }) {
  const initialState = {
    studentName: "", title: "", company: "", location: "", package: "", status: "Pending", description: ""
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (editingJob) setFormData(editingJob);
    else setFormData(initialState);
  }, [editingJob, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="bg-blue-600 text-white px-6 py-4 shrink-0">
          <h2 className="text-2xl font-normal">{editingJob ? "Edit Job Application" : "Add Job Application"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-normal text-gray-700">Student Name *</label>
                <input required type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="font-normal text-gray-700">Job Role *</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="font-normal text-gray-700">Company *</label>
                <input required type="text" name="company" value={formData.company} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="font-normal text-gray-700">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="font-normal text-gray-700">Package (LPA)</label>
                <input type="text" name="package" value={formData.package} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="font-normal text-gray-700">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal outline-none focus:border-blue-500">
                  <option className="font-normal">Pending</option>
                  <option className="font-normal">Approved</option>
                  <option className="font-normal">Rejected</option>
                </select>
              </div>
            </div>
            <div className="mt-5">
              <label className="font-normal text-gray-700">Description / Notes</label>
              <textarea rows="4" name="description" value={formData.description} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-lg p-3 font-normal resize-none outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-normal rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-normal rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}