import React, { useRef } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useApp } from '../../../core/context/AppContext';

export const ProfileSummaryCard = ({ isEditing }) => {
    const { personalInfo, updatePersonalInfo, academicSummary, socialLinks } = useProfile();
    const { data, setData } = useApp();
    const avatarInputRef = useRef(null);

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newUrl = URL.createObjectURL(file);
            updatePersonalInfo({ avatarUrl: newUrl });
            setData({ user: { ...data.user, avatar: newUrl } });
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:w-1/2">
                    <div className="relative shrink-0">
                        <img src={personalInfo.avatarUrl} alt="Profile" className="w-28 h-28 rounded-2xl object-cover border border-gray-200 shadow-sm" />
                        {isEditing && (
                            <button onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow hover:bg-blue-700 transition">
                                <i className="fa-solid fa-camera text-xs"></i>
                            </button>
                        )}
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                            {personalInfo.fullName || 'No Name'} <i className="fa-solid fa-circle-check text-blue-600 text-sm"></i>
                        </h2>
                        <div className="mt-2 mb-4 inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                            Profile Complete 75%
                        </div>
                        <div className="space-y-2.5 text-xs text-gray-600">
                            <div className="flex items-center gap-3 justify-center sm:justify-start">
                                <i className="fa-regular fa-envelope w-3"></i> {personalInfo.email || 'Not specified'}
                            </div>
                            <div className="flex items-center gap-3 justify-center sm:justify-start">
                                <i className="fa-solid fa-phone w-3"></i> {personalInfo.phone || 'Not specified'}
                            </div>
                            <div className="flex items-center gap-3 justify-center sm:justify-start">
                                <i className="fa-solid fa-location-dot w-3"></i> {personalInfo.location || personalInfo.address?.split('\n')[0] || 'Not specified'}
                            </div>
                            <div className="flex items-center gap-3 justify-center sm:justify-start">
                                <i className="fa-regular fa-calendar w-3"></i> {personalInfo.dob || 'Not specified'}
                            </div>
                            <div className="flex items-center gap-3 justify-center sm:justify-start">
                                <i className="fa-brands fa-linkedin text-blue-600 w-3"></i> 
                                {socialLinks.linkedin ? (
                                    <a href={`https://${socialLinks.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                        {socialLinks.linkedin}
                                    </a>
                                ) : (
                                    'Not specified'
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block w-px bg-gray-100"></div>
                <div className="md:w-1/2 flex flex-col justify-center border-t md:border-t-0 pt-6 md:pt-0 border-gray-100">
                    <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                        <div className="text-gray-500">College</div>
                        <div className="text-gray-900 font-medium">{academicSummary.college || 'Not specified'}</div>
                        <div className="text-gray-500">Branch</div>
                        <div className="text-gray-900 font-medium">{academicSummary.branch || 'Not specified'}</div>
                        <div className="text-gray-500">Enrollment No.</div>
                        <div className="text-gray-900 font-medium">{academicSummary.enrollmentNo || 'Not specified'}</div>
                        <div className="text-gray-500">CGPA</div>
                        <div className="text-gray-900 font-medium">{academicSummary.cgpa || 'Not specified'}</div>
                        <div className="text-gray-500">Passing Year</div>
                        <div className="text-gray-900 font-medium">{academicSummary.passingYear || 'Not specified'}</div>
                        <div className="text-gray-500">Current Year</div>
                        <div className="text-gray-900 font-medium">{academicSummary.currentYear || 'Not specified'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
