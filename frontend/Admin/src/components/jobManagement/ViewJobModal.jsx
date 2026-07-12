import React from 'react';

export default function ViewJobModal({ isOpen, onClose, job }) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4 shrink-0 flex justify-between items-center">
          <h2 className="text-2xl font-normal">Job Application Details</h2>
          <button onClick={onClose} className="text-3xl hover:text-gray-200 leading-none">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <DetailItem label="Student Name" value={job.studentName} />
            <DetailItem label="Job Role" value={job.title} />
            <DetailItem label="Company" value={job.company} />
            <DetailItem label="Location" value={job.location} />
            <DetailItem label="Package" value={job.package} />
            <DetailItem label="Status" value={job.status} />
            <DetailItem label="Applied Date" value={job.date} />
          </div>
          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm font-normal text-gray-500 mb-2">Notes / Description</p>
            <p className="font-normal text-gray-900">{job.description || "No notes provided."}</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-normal rounded-lg hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm font-normal text-gray-500 mb-1">{label}</p>
      <p className="font-normal text-gray-900 text-lg">{value || "-"}</p>
    </div>
  );
}