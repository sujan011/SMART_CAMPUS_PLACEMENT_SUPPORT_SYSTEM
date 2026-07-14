import React from 'react';

export const JobCard = ({ job, isSelected, onClick, onSaveToggle }) => {
    const company = job.company_name || job.company || "N/A";
    const salary = job.salary_max ? `${(job.salary_min / 100000).toFixed(1)} - ${(job.salary_max / 100000).toFixed(1)} LPA` : job.salary;
    const tags = job.tags || [
        job.job_type ? job.job_type.replace('_', ' ') : null,
        job.is_remote ? 'Remote' : 'On-site'
    ].filter(Boolean);

    const handleBookmarkClick = (e) => {
        e.stopPropagation();
        if (onSaveToggle) {
            onSaveToggle(job.id);
        }
    };

    return (
        <div 
            onClick={onClick}
            className={`bg-white border rounded-xl p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer relative group ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-500/10 bg-blue-50/5' : 'border-gray-200'
            }`}
        >
            {/* Top Row: Badge and Bookmark */}
            <div className="flex justify-between items-start mb-2">
                {job.match_percent !== null && job.match_percent !== undefined ? (
                    <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 border border-emerald-100">
                        <i className="fa-solid fa-circle-nodes text-[10px]"></i> {job.match_percent}% Skills Match
                    </div>
                ) : (
                    <div className="h-6"></div>
                )}
                <button 
                    onClick={handleBookmarkClick}
                    className={`transition-colors p-1.5 rounded-lg -mr-1.5 -mt-1.5 ${
                        job.is_saved ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <i className={`${job.is_saved ? 'fa-solid' : 'fa-regular'} fa-bookmark text-lg`}></i>
                </button>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {job.title}
            </h2>

            {/* Company and Location */}
            <div className="mb-3">
                <div className="text-sm font-medium text-gray-800">{company}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <i className="fa-solid fa-location-dot"></i> {job.location || (job.is_remote ? 'Remote' : 'On-site')}
                </div>
            </div>

            {/* Tags (Salary, Benefits, etc.) */}
            <div className="flex flex-wrap gap-1.5 mt-3">
                {salary && (
                    <span className="bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-100">
                        {salary}
                    </span>
                )}
                {tags.map((tag, index) => (
                    <span key={index} className="bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-100 capitalize">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};
