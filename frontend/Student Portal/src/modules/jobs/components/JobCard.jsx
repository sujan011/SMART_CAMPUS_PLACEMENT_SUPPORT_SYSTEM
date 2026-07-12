import React from 'react';

export const JobCard = ({ job }) => {
    const company = job.company_name || job.company || "N/A";
    const salary = job.salary_max ? `${(job.salary_min / 100000).toFixed(1)} - ${(job.salary_max / 100000).toFixed(1)} LPA` : job.salary;
    const tags = job.tags || [
        job.job_type ? job.job_type.replace('_', ' ') : null,
        job.is_remote ? 'Remote' : 'On-site'
    ].filter(Boolean);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-4 hover:shadow-md transition-shadow cursor-pointer relative group">
            {/* Top Row: Badge and Bookmark */}
            <div className="flex justify-between items-start mb-2">
                {job.easilyApply ? (
                    <div className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center">
                        Easily apply
                    </div>
                ) : (
                    <div className="h-6"></div> // Spacer if no easily apply badge
                )}
                <button className="text-gray-400 hover:text-gray-900 transition-colors">
                    <i className="fa-regular fa-bookmark text-xl"></i>
                </button>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:underline">
                {job.title}
            </h2>

            {/* Company and Location */}
            <div className="mb-3">
                <div className="text-[15px] text-gray-800">{company}</div>
                <div className="text-[15px] text-gray-600">{job.location}</div>
            </div>

            {/* Tags (Salary, Benefits, etc.) */}
            <div className="flex flex-wrap gap-2 mt-3">
                {salary && (
                    <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-md">
                        {salary}
                    </span>
                )}
                {tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-md">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};
