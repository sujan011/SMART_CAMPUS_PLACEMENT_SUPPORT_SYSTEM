import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from '../../../core/context/AppContext';
import { api } from '../../../core/services/api';
import { ProfileProjectProvider } from "./ProfileProjectContext";

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const { data } = useApp();
    
    // 1. Personal Info State
    const [personalInfo, setPersonalInfo] = useState({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        address: "",
        nationality: "",
        languages: [],
        aboutMe: "",
        avatarUrl: "",
    });

    // 2. Academic Summary State (for the summary widget)
    const [academicSummary, setAcademicSummary] = useState({
        college: '',
        branch: '',
        enrollmentNo: '',
        cgpa: '',
        passingYear: '',
        currentYear: '',
    });

    // 3. Social Links State
    const [socialLinks, setSocialLinks] = useState({
        gmail: '',
        github: '',
        discord: '',
        x: '',
        linkedin: '',
    });

    const fetchProfile = async () => {
        try {

            const { data: p } = await api.getProfile();

            // ----------------------------
            // Personal
            // ----------------------------
            console.log("PROFILE API RESPONSE:", p); //just to check
            setPersonalInfo({
                fullName: p.full_name || "",
                email: p.email || "",
                phone: p.phone || "",
                username: p.username || "",
                dob: p.date_of_birth || "",
                gender:
                    p.gender === "male"
                        ? "Male"
                        : p.gender === "female"
                        ? "Female"
                        : "Other",
                address: p.address || "",
                nationality: p.nationality || "",
                languages: p.languages_known || [],
                aboutMe: p.about_me || "",
                avatarUrl:
                    p.profile_photo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        p.full_name || "Student"
                    )}`,
            });

            // ----------------------------
            // Academic
            // ----------------------------

            setAcademicSummary({
                college: p.college || "",
                branch: p.branch || "",
                enrollmentNo: p.enrollment_no || "",
                cgpa: p.cgpa || "",
                passingYear: p.passing_year || "",
                currentYear: p.current_year || "",
            });

            // ----------------------------
            // Social
            // ----------------------------

            setSocialLinks({
                gmail: p.email || "",
                github: p.github_url || "",
                discord: "",
                x: p.portfolio_url || "",
                linkedin: p.linkedin_url || "",
            });

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [data?.user?.avatar]);

    // Handlers
    const updatePersonalInfo = async (updates) => {
        console.log("updatePersonalInfo called");
        console.log(updates);

        setPersonalInfo(prev => ({
            ...prev,
            ...updates,
        }));

        try {

            const formData = new FormData();

            formData.append(
                "full_name",
                updates.fullName && updates.fullName !== "undefined"
                    ? updates.fullName
                    : personalInfo.fullName
            );
            formData.append("address", updates.address || "");
            formData.append("nationality", updates.nationality || "");
            formData.append("gender", updates.gender?.toLowerCase() || "");
            formData.append("date_of_birth", updates.dob || "");
            formData.append("about_me", updates.aboutMe || "");
            formData.append(
                "languages_known",
                JSON.stringify(updates.languages || [])
            );

            if (updates.profilePhoto) {
                formData.append(
                    "profile_photo",
                    updates.profilePhoto
                );
            }

            for (const pair of formData.entries()) {
                console.log(pair[0], pair[1]);

                if (pair[1] instanceof File) {
                    console.log("File name:", pair[1].name);
                    console.log("File type:", pair[1].type);
                    console.log("File size:", pair[1].size);
                }
            }

            const { data } = await api.updateProfile(formData);

            setPersonalInfo(prev => ({
                ...prev,
                fullName: data.full_name || "",
                email: data.email || "",
                phone: data.phone || "",
                username: data.username || "",
                dob: data.date_of_birth || "",
                gender:
                    data.gender === "male"
                        ? "Male"
                        : data.gender === "female"
                        ? "Female"
                        : "Other",
                address: data.address || "",
                nationality: data.nationality || "",
                languages: data.languages_known || [],
                aboutMe: data.about_me || "",
                profilePhoto: null,
                avatarUrl: data.profile_photo
                    ? `http://127.0.0.1:8000${data.profile_photo}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        data.full_name || "Student"
                    )}`,
            }));

        } catch (err) {
            console.error(err);
        }

    };

    const updateAcademicSummary = async (updates) => {

        setAcademicSummary(prev => ({
            ...prev,
            ...updates,
        }));

        try {

            await api.updateProfile({

                college: updates.college,
                branch: updates.branch,
                enrollment_no: updates.enrollmentNo,
                cgpa: updates.cgpa || null,
                passing_year: updates.passingYear || null,
                current_year: updates.currentYear,

            });

            fetchProfile();

        } catch (err) {

            console.error(err);

        }

    };

    const updateSocialLinks = async (updates) => {
        setSocialLinks(prev => ({ ...prev, ...updates }));
        try {
            await api.updateProfile({
                github_url: updates.github,
                linkedin_url: updates.linkedin,
                portfolio_url: updates.x,
            });
            fetchProfile();
        } catch (e) {
            console.error("Failed to update social links", e);
        }
    };

    const value = {
        personalInfo,
        updatePersonalInfo,
        academicSummary,
        updateAcademicSummary,
        socialLinks,
        updateSocialLinks,
    };

    return (
        <ProfileContext.Provider value={value}>
            <ProfileProjectProvider>
                {children}
            </ProfileProjectProvider>
        </ProfileContext.Provider>
    );
};
