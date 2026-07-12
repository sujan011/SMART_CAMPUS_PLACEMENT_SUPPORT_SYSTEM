import API from "./axios";

export const api = {

    // -----------------------
    // Authentication
    // -----------------------

    login: (data) =>
        API.post("/auth/login/", data),

    register: (data) =>
        API.post("/auth/register/", data),

    getCurrentUser: () =>
        API.get("/auth/me/"),

    // -----------------------
    // Dashboard
    // -----------------------

    getDashboardData: () =>
        API.get("/dashboard/student/"),

    // -----------------------
    // Profile
    // -----------------------

    getProfile: () =>
        API.get("/students/profile/"),

    updateProfile: (data) =>
        API.patch("/students/profile/", data),

    // -----------------------
    // Jobs
    // -----------------------

    getJobs: () =>
        API.get("/jobs/"),

    getJobDetails: (id) =>
        API.get(`/jobs/${id}/`),

    saveJob: (id) =>
        API.post(`/jobs/${id}/save/`),

    getSavedJobs: () =>
        API.get("/jobs/saved/"),

    // -----------------------
    // Applications
    // -----------------------

    getApplications: () =>
        API.get("/applications/"),

    applyJob: (formData) =>
        API.post("/applications/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),

    // -----------------------
    // Resume
    // -----------------------

    getResume: () =>
        API.get("/resume/"),

    updateResume: (data) =>
        API.patch("/resume/", data),

    // -----------------------
    // ATS
    // -----------------------

    analyzeResume: (formData) =>
        API.post("/resume/ats/analyze/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),

    getLatestATS: () =>
        API.get("/resume/ats/latest/"),

    // -----------------------
    // Chatbot
    // -----------------------

    sendChatMessage: (data) =>
        API.post("/chatbot/send/", data),

    getChatSessions: () =>
        API.get("/chatbot/sessions/"),

    // -----------------------
    // Preparation
    // -----------------------

    getPrepDashboard: () =>
        API.get("/preparation/dashboard/"),

    getPrepTopics: (slug) =>
        API.get(`/preparation/categories/${slug}/topics/`),

    updateTopicProgress: (id, percent) =>
        API.post(`/preparation/topics/${id}/progress/`, { progress_percent: percent }),

    getMockInterviews: () =>
        API.get("/preparation/mock-interviews/"),

    scheduleMockInterview: (data) =>
        API.post("/preparation/mock-interviews/", data),

    // -----------------------
    // Academic Records
    // -----------------------
    getAcademicRecords: () =>
        API.get("/students/academic-records/"),

    createAcademicRecord: (data) =>
        API.post("/students/academic-records/", data),

    updateAcademicRecord: (id, data) =>
        API.put(`/students/academic-records/${id}/`, data),

    deleteAcademicRecord: (id) =>
        API.delete(`/students/academic-records/${id}/`),

    // -----------------------
    // Skills
    // -----------------------
    getSkills: () =>
        API.get("/students/skills/"),

    createSkill: (data) =>
        API.post("/students/skills/", data),

    updateSkill: (id, data) =>
        API.put(`/students/skills/${id}/`, data),

    deleteSkill: (id) =>
        API.delete(`/students/skills/${id}/`),

    // -----------------------
    // Projects
    // -----------------------
    getProjects: () =>
        API.get("/students/projects/"),

    createProject: (data) =>
        API.post("/students/projects/", data),

    updateProject: (id, data) =>
        API.put(`/students/projects/${id}/`, data),

    deleteProject: (id) =>
        API.delete(`/students/projects/${id}/`),

    // -----------------------
    // Certifications
    // -----------------------
    getCertifications: () =>
        API.get("/students/certifications/"),

    createCertification: (data) =>
        API.post("/students/certifications/", data),

    updateCertification: (id, data) =>
        API.put(`/students/certifications/${id}/`, data),

    deleteCertification: (id) =>
        API.delete(`/students/certifications/${id}/`),
};