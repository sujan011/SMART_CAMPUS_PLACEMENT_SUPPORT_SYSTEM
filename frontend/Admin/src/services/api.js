import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT token automatically
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("admin_access");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const api = {
    login: (data) =>
        API.post("/auth/login/", data),

    register: (data) =>
        API.post("/auth/register/", data),

    getDashboard: () =>
        API.get("/dashboard/officer/"),

    getStudents: () =>
        API.get("/students/"),

    updateStudentStatus: (id, isActive) =>
        API.patch(`/students/${id}/status/`, { is_active: isActive }),

    deleteStudent: (id) =>
        API.delete(`/students/${id}/delete/`),

    getCompanies: () =>
        API.get("/companies/"),

    createCompany: (data) =>
        API.post("/companies/", data),

    updateCompany: (id, data) =>
        API.patch(`/companies/${id}/`, data),

    deleteCompany: (id) =>
        API.delete(`/companies/${id}/`),

    getJobs: () =>
        API.get("/jobs/"),

    createJob: (data) =>
        API.post("/jobs/", data),

    updateJob: (id, data) =>
        API.patch(`/jobs/${id}/`, data),

    deleteJob: (id) =>
        API.delete(`/jobs/${id}/`),

    getNotifications: () =>
        API.get("/notifications/"),

    markNotificationRead: (id) =>
        API.post(`/notifications/${id}/read/`),

    markAllNotificationsRead: () =>
        API.post("/notifications/mark-all-read/"),

    broadcastNotification: (data) =>
        API.post("/notifications/broadcast/", data),
};
