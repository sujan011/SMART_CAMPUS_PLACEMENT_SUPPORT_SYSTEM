import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';

export const PersonalInfoForm = ({ isEditing, setIsEditing }) => {
    const { personalInfo, updatePersonalInfo } = useProfile();
    const [localData, setLocalData] = useState(personalInfo);
    
    // Available languages could be moved to context or fetched from an API, but keeping it simple here
    const availableLanguages = ['English', 'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati'];
    const [languages, setLanguages] = useState(['English', 'Hindi']);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    // Sync local state when entering edit mode
    useEffect(() => {
        if (isEditing) {
            setLocalData(personalInfo);
        }
    }, [isEditing, personalInfo]);

    const handleChange = (field, value) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        updatePersonalInfo(localData);
        setIsEditing(false);
    };

    const addLanguage = (lang) => {
        if (!languages.includes(lang)) {
            setLanguages([...languages, lang]);
        }
        setShowLanguageDropdown(false);
    };

    const removeLanguage = (lang) => {
        setLanguages(languages.filter(l => l !== lang));
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField label="Full Name" value={isEditing ? localData.fullName : personalInfo.fullName} onChange={(val) => handleChange('fullName', val)} isEditing={isEditing} />
                <InputField label="Email" value={isEditing ? localData.email : personalInfo.email} onChange={(val) => handleChange('email', val)} type="email" isEditing={isEditing} />
                <InputField label="Phone" value={isEditing ? localData.phone : personalInfo.phone} onChange={(val) => handleChange('phone', val)} isEditing={isEditing} />
                <InputField label="Date of Birth" value={isEditing ? localData.dob : personalInfo.dob} onChange={(val) => handleChange('dob', val)} type="date" isEditing={isEditing} />
                <SelectField label="Gender" value={isEditing ? localData.gender : personalInfo.gender} onChange={(val) => handleChange('gender', val)} options={['Male', 'Female', 'Other']} isEditing={isEditing} />
                
                <div className="md:row-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                    <textarea 
                        className={`w-full p-3 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`}
                        disabled={!isEditing}
                        rows="4"
                        value={isEditing ? localData.address : personalInfo.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                    ></textarea>
                </div>
                
                <SelectField label="Nationality" value={isEditing ? localData.nationality : personalInfo.nationality} onChange={(val) => handleChange('nationality', val)} options={['Indian', 'Other']} isEditing={isEditing} />
                
                {/* Languages Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Languages Known</label>
                    <div className={`w-full p-2.5 border rounded-lg flex flex-wrap items-center gap-2 ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50/50'}`}>
                        {languages.map(lang => (
                            <span key={lang} className="bg-gray-100 border border-gray-200 text-gray-700 px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5">
                                {lang} 
                                {isEditing && (
                                    <i 
                                        className="fa-solid fa-times cursor-pointer hover:text-red-500"
                                        onClick={() => removeLanguage(lang)}
                                    ></i>
                                )}
                            </span>
                        ))}
                        {isEditing && availableLanguages.filter(l => !languages.includes(l)).length > 0 && (
                            <div className="relative ml-1">
                                <button 
                                    className="text-xs bg-transparent border-none outline-none text-blue-600 cursor-pointer font-medium"
                                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                                >
                                    + Add Language
                                </button>
                                {showLanguageDropdown && (
                                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto w-32">
                                        {availableLanguages.filter(l => !languages.includes(l)).map(lang => (
                                            <div 
                                                key={lang}
                                                className="px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                                                onClick={() => addLanguage(lang)}
                                            >
                                                {lang}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isEditing && (
                <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition">
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

/* Helper Components */
const InputField = ({ label, value, onChange, type = "text", isEditing }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input 
            type={type} 
            className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`}
            disabled={!isEditing} 
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const SelectField = ({ label, value, onChange, options, isEditing }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <select 
                className={`w-full p-2.5 border rounded-lg text-sm appearance-none transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`}
                disabled={!isEditing}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <i className={`fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${isEditing ? 'text-gray-500' : 'text-gray-400'}`}></i>
        </div>
    </div>
);
