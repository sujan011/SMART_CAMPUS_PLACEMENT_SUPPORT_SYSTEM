import React from 'react';

export default function JobFilter({ statusFilter, setStatusFilter, onAddJob }) {
  return (
    <div className="flex gap-3">
      <select 
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-normal focus:outline-none focus:border-blue-500"
      >
        <option className="font-normal" value="All">All Status</option>
        <option className="font-normal" value="Pending">Pending</option>
        <option className="font-normal" value="Approved">Approved</option>
        <option className="font-normal" value="Rejected">Rejected</option>
      </select>
      
      <button 
        onClick={onAddJob}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-normal flex items-center gap-2 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        Add Job
      </button>
    </div>
  );
}