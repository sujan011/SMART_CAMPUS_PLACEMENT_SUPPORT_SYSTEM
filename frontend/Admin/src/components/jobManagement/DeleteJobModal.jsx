import React from 'react';

export default function DeleteJobModal({ isOpen, onClose, job, onConfirm }) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-xl font-normal text-center text-gray-900 mb-2">Delete Application?</h2>
          <p className="text-center font-normal text-gray-500">
            Are you sure you want to delete the application for <span className="text-gray-900">"{job.studentName}"</span> at <span className="text-gray-900">"{job.company}"</span>? This action cannot be undone.
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-normal rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => onConfirm(job.id)} className="px-5 py-2.5 bg-red-600 text-white font-normal rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}