import React from 'react';

export default function JobTable({ jobs, onView, onEdit, onDelete, onApprove, onReject }) {
  return (
    <div className="overflow-y-auto flex-1">
      <table className="w-full text-left whitespace-nowrap">
        <thead className="bg-blue-600 sticky top-0 z-10">
          <tr>
            <th className="py-3 px-4 text-sm font-normal text-white">Student Name</th>
            <th className="py-3 px-4 text-sm font-normal text-white">Job Role</th>
            <th className="py-3 px-4 text-sm font-normal text-white">Company</th>
            <th className="py-3 px-4 text-sm font-normal text-white">Location</th>
            <th className="py-3 px-4 text-sm font-normal text-white">Package</th>
            <th className="py-3 px-4 text-sm font-normal text-white">Status</th>
            <th className="py-3 px-4 text-sm font-normal text-white">Date</th>
            <th className="py-3 px-4 text-sm font-normal text-white text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50/50">
              <td className="py-3 px-4 text-sm font-normal text-gray-900">{job.studentName}</td>
              <td className="py-3 px-4 text-sm font-normal text-gray-700">{job.title}</td>
              <td className="py-3 px-4 text-sm font-normal text-gray-700">{job.company}</td>
              <td className="py-3 px-4 text-sm font-normal text-gray-700">{job.location}</td>
              <td className="py-3 px-4 text-sm font-normal text-gray-700">{job.package}</td>
              <td className="py-3 px-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-normal ${job.statusColor}`}>
                  {job.status}
                </span>
              </td>
              <td className="py-3 px-4 text-sm font-normal text-gray-700">{job.date}</td>
              
              <td className="py-3 px-4 flex justify-end gap-1.5 items-center">
                <button onClick={() => onView(job)} className="p-1 text-gray-400 hover:text-blue-600" title="View">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </button>
                <button onClick={() => onEdit(job)} className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                
                <div className="w-px h-4 bg-gray-200 mx-1"></div>

                <button 
                  onClick={() => onApprove(job.id)}
                  disabled={job.status === 'Approved'}
                  className={`p-1 ${job.status === 'Approved' ? 'text-green-300 cursor-not-allowed' : 'text-gray-400 hover:text-green-600'}`} title="Approve">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
                <button 
                  onClick={() => onReject(job.id)}
                  disabled={job.status === 'Rejected'}
                  className={`p-1 ${job.status === 'Rejected' ? 'text-red-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600'}`} title="Reject">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="w-px h-4 bg-gray-200 mx-1"></div>

                <button onClick={() => onDelete(job)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}