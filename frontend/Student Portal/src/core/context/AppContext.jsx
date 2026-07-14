import React, { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../services/api';
const AppContext = createContext(null);

const formatTime = (dateString) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    } catch (e) {
        return dateString;
    }
};

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // We keep data in state so we can mutate it upon login
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [chatMessages, setChatMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [jobFilter, setJobFilter] = useState('all');

    useEffect(() => {

        const initializeApp = async () => {

            try {

                const access = localStorage.getItem("access");

                // If no token exists, stop here
                if (!access) {
                    setIsLoading(false);
                    return;
                }

                // Load current user
                const userResponse = await api.getCurrentUser();
                console.log("Current User:", userResponse.data);

                setCurrentUser(userResponse.data);
                setIsAuthenticated(true);

                // Now load dashboard
                const dashboardResponse = await api.getDashboardData();

                const dashboard = dashboardResponse.data;

                // Load notifications
                let initialNotifications = [];
                try {
                    const notifResponse = await api.getNotifications();
                    const list = notifResponse.data.results || notifResponse.data || [];
                    initialNotifications = list.map(n => ({
                        ...n,
                        read: n.is_read,
                        time: formatTime(n.created_at)
                    }));
                } catch (e) {
                    console.error("Failed to load initial notifications:", e);
                }

                setData({
                    user: {
                        name: userResponse.data.username,
                        department: userResponse.data.department || "Student",
                        avatar:
                            userResponse.data.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(userResponse.data.username)}`,
                    },

                    metrics: {
                        profileCompletion: dashboard.profile_completion,
                        placementReadiness: dashboard.resume_score,
                        applications: dashboard.applications,
                        inProgress: 0,
                        upcomingInterviews: dashboard.upcoming_interviews.length,
                        nextInterview:
                            dashboard.upcoming_interviews.length > 0
                                ? dashboard.upcoming_interviews[0].scheduled_at
                                : "No Interview",
                        progressScore: dashboard.profile_completion,
                    },

                    recommendedJobs: dashboard.recommended_jobs,
                    applications: dashboard.recent_applications,
                    upcomingInterviews: dashboard.upcoming_interviews,
                    notifications: initialNotifications,
                });

            } catch (error) {

                console.error(error);

                localStorage.removeItem("access");
                localStorage.removeItem("refresh");

                setCurrentUser(null);
                setIsAuthenticated(false);

            } finally {

                setIsLoading(false);

            }

        };

        initializeApp();

    }, []);

    const login = async (email, password) => {

        try {

            console.log(email);
            console.log(password);

            const response = await api.login({
                email,
                password,
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            const userResponse = await api.getCurrentUser();

            setCurrentUser(userResponse.data);
            setIsAuthenticated(true);

            const dashboardResponse = await api.getDashboardData();

            const dashboard = dashboardResponse.data;

            // Load notifications
            let initialNotifications = [];
            try {
                const notifResponse = await api.getNotifications();
                const list = notifResponse.data.results || notifResponse.data || [];
                initialNotifications = list.map(n => ({
                    ...n,
                    read: n.is_read,
                    time: formatTime(n.created_at)
                }));
            } catch (e) {
                console.error("Failed to load initial notifications:", e);
            }

            setData({
                user: {
                    name: userResponse.data.username,
                    department: userResponse.data.department || "Student",
                    avatar:
                        userResponse.data.avatar ||
                        "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(userResponse.data.username),
                },

                metrics: {
                    profileCompletion: dashboard.profile_completion,
                    placementReadiness: dashboard.resume_score,
                    applications: dashboard.applications,
                    inProgress: 0,
                    upcomingInterviews: dashboard.upcoming_interviews,
                    nextInterview: "No Interview",
                    progressScore: dashboard.profile_completion,
                },

                recommendedJobs: [],
                applications: dashboard.recent_applications,
                upcomingInterviews: [],
                notifications: initialNotifications,
            });

            return {
                success: true,
            };

        } catch (error) {

            console.error(error);

            return {
                success: false,
                message:
                    error.response?.data?.non_field_errors?.[0] ||
                    error.response?.data?.detail ||
                    "Login failed",
            };
        }
    };

    const register = async (userData) => {

        try {

            const response = await api.register({
                username: userData.username,
                email: userData.email,
                password: userData.password,
                password2: userData.password,
                phone: userData.phone,
                role: "student",

                full_name: userData.name,
                college: userData.college,
                branch: userData.department,
                enrollment_no: userData.registrationNumber,
                current_year: "",
            });

            // Save JWT Tokens

            localStorage.setItem(
                "access",
                response.data.access
            );

            localStorage.setItem(
                "refresh",
                response.data.refresh
            );

            // Save Logged-in User

            setCurrentUser(response.data.user);

            setIsAuthenticated(true);

            return response.data.user;

        }

        catch (error) {

            console.log("========== ERROR ==========");
            console.log(error);

            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);
            }

            throw error;
        }

    };

    const logout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setCurrentUser(null);
        setIsAuthenticated(false);
    };


    const getProfile = async () => {
        try {
            const response = await api.getProfile();
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    const updateData = (newData) => setData(prev => ({ ...prev, ...newData }));
    const addChatMessage = (msg) => setChatMessages(prev => [...prev, msg]);

    return (
        <AppContext.Provider value={{
            currentUser, isAuthenticated, login, register, logout,
            data, setData: updateData,
            isLoading, error,
            chatMessages, setChatMessages, addChatMessage,
            searchQuery, setSearchQuery,
            jobFilter, setJobFilter,
            getProfile,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
