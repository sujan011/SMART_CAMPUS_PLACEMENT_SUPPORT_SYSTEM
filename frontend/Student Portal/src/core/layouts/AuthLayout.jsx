import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">SC</div>
                    <h2 className="text-2xl font-bold text-gray-900">Smart Campus</h2>
                    <p className="text-gray-500 mt-1">Placement Support Portal</p>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-xl shadow-blue-900/5 border border-gray-100">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
