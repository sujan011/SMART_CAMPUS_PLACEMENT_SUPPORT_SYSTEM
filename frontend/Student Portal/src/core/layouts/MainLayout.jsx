import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';

export const MainLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNav />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
