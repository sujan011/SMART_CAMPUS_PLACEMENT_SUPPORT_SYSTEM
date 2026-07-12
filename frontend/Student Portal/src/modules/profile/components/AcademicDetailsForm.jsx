import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';

export const AcademicDetailsForm = () => {
    const { academicSummary, updateAcademicSummary } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState(academicSummary);

    // Sync local state when entering edit mode
    useEffect(() => {
        if (isEditing) {
            setLocalData(academicSummary);
        }
    }, [isEditing, academicSummary]);

    const handleChange = (field, value) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        updateAcademicSummary(localData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalData(academicSummary);
        setIsEditing(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Academic Summary</h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 border border-blue-100">
                        <i className="fa-solid fa-pen"></i> Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <InputField label="College" value={localData.college} onChange={(val) => handleChange('college', val)} />
                        <InputField label="Branch" value={localData.branch} onChange={(val) => handleChange('branch', val)} />
                        <InputField label="Enrollment No." value={localData.enrollmentNo} onChange={(val) => handleChange('enrollmentNo', val)} />
                        <InputField label="CGPA" value={localData.cgpa} onChange={(val) => handleChange('cgpa', val)} />
                        <InputField label="Passing Year" value={localData.passingYear} onChange={(val) => handleChange('passingYear', val)} />
                        <InputField label="Current Year Status" value={localData.currentYear} onChange={(val) => handleChange('currentYear', val)} />
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
                        <button 
                            onClick={handleCancel} 
                            className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition border border-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">College</div>
                        <div className="text-sm font-medium text-gray-900">{academicSummary.college || 'Not specified'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Branch</div>
                        <div className="text-sm font-medium text-gray-900">{academicSummary.branch || 'Not specified'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Enrollment No.</div>
                        <div className="text-sm font-medium text-gray-900">{academicSummary.enrollmentNo || 'Not specified'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">CGPA</div>
                        <div className="text-sm font-medium text-gray-900">{academicSummary.cgpa || 'Not specified'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Passing Year</div>
                        <div className="text-sm font-medium text-gray-900">{academicSummary.passingYear || 'Not specified'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Current Year Status</div>
                        <div className="text-sm font-medium text-gray-900">{academicSummary.currentYear || 'Not specified'}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* Helper Component */
const InputField = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input 
            type="text" 
            className="w-full p-2.5 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);
