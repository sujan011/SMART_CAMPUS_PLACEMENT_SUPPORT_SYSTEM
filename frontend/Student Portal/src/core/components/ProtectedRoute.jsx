import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export const ProtectedRoute = ({ children }) => {

    const {isAuthenticated, isLoading,} = useApp();

    const location = useLocation();

    // Wait until authentication check finishes
    if (isLoading) {

        return (
            <div className="flex items-center justify-center h-screen">
                <h2 className="text-lg font-semibold">
                    Loading...
                </h2>
            </div>
        );

    }

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/signin"
                state={{ from: location }}
                replace
            />
        );

    }

    return children;

};