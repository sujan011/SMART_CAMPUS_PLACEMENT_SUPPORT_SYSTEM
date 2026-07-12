import React from 'react';

export default function JobSearch({ searchTerm, setSearchTerm }) {
  return (
    <div className="relative flex-1 max-w-md">
      <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <input 
        type="text" 
        placeholder="Search by Student, Role or Company..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-normal focus:outline-none focus:border-blue-500" 
      />
    </div>
  );
}