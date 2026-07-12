import React from 'react';

export default function JobStats({ jobs }) {
  const pendingCount = jobs.filter(j => j.status === 'Pending').length;
  const approvedCount = jobs.filter(j => j.status === 'Approved').length;
  const rejectedCount = jobs.filter(j => j.status === 'Rejected').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm font-normal text-gray-500 mb-1">Total Applications</p>
          <h3 className="text-2xl font-normal text-gray-900">{jobs.length}</h3>
        </div>
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm font-normal text-gray-500 mb-1">Pending Approval</p>
          <h3 className="text-2xl font-normal text-gray-900">{pendingCount}</h3>
        </div>
        <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm font-normal text-gray-500 mb-1">Approved Jobs</p>
          <h3 className="text-2xl font-normal text-gray-900">{approvedCount}</h3>
        </div>
        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm font-normal text-gray-500 mb-1">Rejected Jobs</p>
          <h3 className="text-2xl font-normal text-gray-900">{rejectedCount}</h3>
        </div>
        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
      </div>
    </div>
  );
}