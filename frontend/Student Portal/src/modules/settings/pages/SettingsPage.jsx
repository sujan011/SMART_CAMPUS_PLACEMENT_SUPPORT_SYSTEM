import React from 'react';
import { useApp } from '../../../core/context/AppContext';

export const SettingsPage = () => {
    const { logout } = useApp();

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Preferences</h3>
                    <p className="text-sm text-gray-500 mb-4">Manage your account settings and preferences.</p>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                            <p className="font-medium text-gray-900">Email Notifications</p>
                            <p className="text-sm text-gray-500">Receive updates about new job postings.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                            <p className="font-medium text-gray-900">SMS Alerts</p>
                            <p className="text-sm text-gray-500">Receive SMS for interview schedules.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Security</h3>
                    <p className="text-sm text-gray-500 mb-4">Update your password and secure your account.</p>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                        Change Password
                    </button>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-sm text-gray-500 mb-4">Log out or delete your account from the portal.</p>
                    <div className="flex gap-4">
                        <button 
                            onClick={logout}
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
