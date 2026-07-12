import React from 'react';

export const NotificationsPage = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                <i className="fa-regular fa-bell text-gray-300 text-4xl mb-3"></i>
                <h3 className="text-lg font-medium text-gray-900">No New Notifications</h3>
                <p className="text-gray-500 mt-1">You're all caught up! Check back later for updates.</p>
            </div>
        </div>
    );
};
