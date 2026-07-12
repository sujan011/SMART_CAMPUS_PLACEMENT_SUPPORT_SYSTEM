import API from "./axios";

export const api = {
    // -----------------------
    // Authentication
    // -----------------------
    login: (data) =>
        API.post("/auth/login/", data),

    getCurrentUser: () =>
        API.get("/auth/me/"),

    // -----------------------
    // Dashboard
    // -----------------------
    getDashboard: () =>
        API.get("/dashboard/officer/"),

    // -----------------------
    // Students
    // -----------------------
    getStudents: (params) =>
        API.get("/students/", { params }),

    verifyStudent: (id) =>
        API.post(`/students/${id}/verify/`),

    // -----------------------
    // Companies
    // -----------------------
    getCompanies: () =>
        API.get("/companies/"),

    createCompany: (data) =>
        API.post("/companies/", data),

    deleteCompany: (id) =>
        API.delete(`/companies/${id}/`),

    // -----------------------
    // Jobs
    // -----------------------
    getJobs: () =>
        API.get("/jobs/"),

    createJob: (data) =>
        API.post("/jobs/", data),

    deleteJob: (id) =>
        API.delete(`/jobs/${id}/`),

    // -----------------------
    // Applications
    // -----------------------
    getApplications: (params) =>
        API.get("/applications/", { params }),

    updateApplicationStatus: (id, data) =>
        API.patch(`/applications/${id}/status/`, data),

    scheduleInterview: (id, data) =>
        API.post(`/applications/${id}/schedule-interview/`, data),
};
