import React, { useState, useEffect } from 'react';
import { JobCard } from '../components/JobCard';
import { api } from '../../../core/services/api';

export const SearchJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.getJobs()
            .then(res => {
                const list = res.data.results || res.data;
                setJobs(list);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) return <div className="p-6 text-center text-gray-500">Loading jobs...</div>;
    if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-4 sm:p-6 max-w-3xl mx-auto min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Jobs</h1>
                <p className="text-gray-500 mb-4">
                    Find and apply to the latest opportunities.
                </p>

                <input
                    type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by job title, company or location..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            {/* Job Listings List */}
            <div className="space-y-4">
                {jobs
                    .filter(job =>
                        job.title?.toLowerCase().includes(search.toLowerCase()) ||
                        job.company_name?.toLowerCase().includes(search.toLowerCase()) ||
                        job.location?.toLowerCase().includes(search.toLowerCase())
                    )
                .map(job => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    );
};
