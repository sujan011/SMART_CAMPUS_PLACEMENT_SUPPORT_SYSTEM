import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';

export const SocialLinksForm = () => {
    const { socialLinks, updateSocialLinks } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState(socialLinks);

    useEffect(() => {
        if (isEditing) {
            setLocalData(socialLinks);
        }
    }, [isEditing, socialLinks]);

    const handleSocialChange = (platform, value) => {
        setLocalData(prev => ({ ...prev, [platform]: value }));
    };

    const handleSave = () => {
        updateSocialLinks(localData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalData(socialLinks);
        setIsEditing(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Your Social Profiles</h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 border border-blue-100">
                        <i className="fa-solid fa-pen"></i> Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-5">
                    {[
                        { id: 'gmail', label: 'Gmail', icon: 'fa-regular fa-envelope', placeholder: 'Enter your email address' },
                        { id: 'github', label: 'GitHub', icon: 'fa-brands fa-github', placeholder: 'github.com/username' },
                        { id: 'discord', label: 'Discord', icon: 'fa-brands fa-discord', placeholder: 'Username#0000' },
                        { id: 'x', label: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', placeholder: 'x.com/username' },
                        { id: 'linkedin', label: 'LinkedIn', icon: 'fa-brands fa-linkedin', placeholder: 'linkedin.com/in/username' },
                    ].map((platform) => (
                        <div key={platform.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">{platform.label}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className={`${platform.icon} text-gray-400 text-sm`}></i>
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-11 p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
                                    placeholder={platform.placeholder}
                                    value={localData[platform.id]}
                                    onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                    
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { id: 'gmail', label: 'Gmail', icon: 'fa-regular fa-envelope', color: 'text-red-500', bg: 'bg-red-50' },
                        { id: 'github', label: 'GitHub', icon: 'fa-brands fa-github', color: 'text-gray-900', bg: 'bg-gray-100' },
                        { id: 'discord', label: 'Discord', icon: 'fa-brands fa-discord', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                        { id: 'x', label: 'X.com', icon: 'fa-brands fa-x-twitter', color: 'text-gray-800', bg: 'bg-gray-100' },
                        { id: 'linkedin', label: 'LinkedIn', icon: 'fa-brands fa-linkedin', color: 'text-blue-600', bg: 'bg-blue-50' },
                    ].map((platform) => (
                        <div key={platform.id} className="flex items-center justify-between p-5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4 min-w-0 pr-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${platform.bg} ${platform.color} shadow-sm`}>
                                    <i className={`${platform.icon} text-xl`}></i>
                                </div>
                                <div className="truncate">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{platform.label}</p>
                                    {socialLinks[platform.id] ? (
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {socialLinks[platform.id]}
                                        </p>
                                    ) : (
                                        <p className="text-sm italic text-gray-400">Not linked</p>
                                    )}
                                </div>
                            </div>
                            {socialLinks[platform.id] && (
                                <a 
                                    href={socialLinks[platform.id].includes('http') || platform.id === 'gmail' || platform.id === 'discord' ? (platform.id === 'gmail' ? `mailto:${socialLinks[platform.id]}` : socialLinks[platform.id]) : `https://${socialLinks[platform.id]}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition shrink-0 shadow-sm opacity-0 group-hover:opacity-100"
                                >
                                    <i className="fa-solid fa-arrow-up-right-from-square text-sm"></i>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
