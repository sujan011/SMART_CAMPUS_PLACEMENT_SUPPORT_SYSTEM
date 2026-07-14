import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../../../core/services/api";

const SkillsContext = createContext();

export const useSkills = () => useContext(SkillsContext);

export const SkillsProvider = ({ children }) => {

    const [skills, setSkills] = useState([]);

    const fetchSkills = async () => {
        try {
            const { data } = await api.getSkills();
            setSkills(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const addSkill = async (skill) => {
        await api.createSkill(skill);
        fetchSkills();
    };

    const updateSkill = async (id, skill) => {
        await api.updateSkill(id, skill);
        fetchSkills();
    };

    const deleteSkill = async (id) => {
        await api.deleteSkill(id);
        fetchSkills();
    };

    return (
        <SkillsContext.Provider
            value={{
                skills,
                addSkill,
                updateSkill,
                deleteSkill,
                fetchSkills,
            }}
        >
            {children}
        </SkillsContext.Provider>
    );
};