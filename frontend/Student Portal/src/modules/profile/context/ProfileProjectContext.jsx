import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../../../core/services/api";

const ProfileProjectContext = createContext();

export const useProfileProjects = () => useContext(ProfileProjectContext);

export const ProfileProjectProvider = ({ children }) => {

    const [projects, setProjects] = useState([]);

    const fetchProjects = async () => {
        try {
            const { data } = await api.getProjects();
            setProjects(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const addProject = async (project) => {
        try {
            await api.createProject(project);
            fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    const updateProject = async (id, project) => {
        try {
            await api.updateProject(id, project);
            fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteProject = async (id) => {
        try {
            await api.deleteProject(id);
            fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <ProfileProjectContext.Provider
            value={{
                projects,
                fetchProjects,
                addProject,
                updateProject,
                deleteProject,
            }}
        >
            {children}
        </ProfileProjectContext.Provider>
    );
};