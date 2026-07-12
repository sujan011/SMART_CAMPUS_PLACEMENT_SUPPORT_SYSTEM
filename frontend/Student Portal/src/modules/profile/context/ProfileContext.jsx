import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from '../../../core/context/AppContext';
import { api } from '../../../core/services/api';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const { data } = useApp();
    
    // 1. Personal Info State
    const [personalInfo, setPersonalInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        gender: 'Male',
        address: '',
        nationality: 'Indian',
        avatarUrl: 'https://via.placeholder.com/150',
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

    const fetchProfile = () => {
        api.getProfile()
            .then(res => {
                const p = res.data;
                setPersonalInfo({
                    fullName: p.full_name || '',
                    email: p.email || '',
                    phone: p.phone || '',
                    dob: p.date_of_birth || '',
                    gender: p.gender === 'male' ? 'Male' : p.gender === 'female' ? 'Female' : 'Other',
                    address: p.address || '',
                    nationality: p.nationality || 'Indian',
                    avatarUrl: p.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'Student')}`,
                });

                setAcademicSummary({
                    college: p.college || '',
                    branch: p.branch || '',
                    enrollmentNo: p.enrollment_no || '',
                    cgpa: p.cgpa ? `${p.cgpa} / 10` : '',
                    passingYear: p.passing_year ? String(p.passing_year) : '',
                    currentYear: p.current_year || '',
                });

                setSocialLinks({
                    gmail: p.email || '',
                    github: p.github_url || '',
                    discord: '',
                    x: p.portfolio_url || '',
                    linkedin: p.linkedin_url || '',
                });
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchProfile();
    }, [data?.user?.avatar]);

    // Handlers
    const updatePersonalInfo = async (updates) => {
        setPersonalInfo(prev => ({ ...prev, ...updates }));
        try {
            await api.updateProfile({
                full_name: updates.fullName,
                address: updates.address,
                nationality: updates.nationality,
                gender: updates.gender?.toLowerCase(),
                date_of_birth: updates.dob || null,
            });
            fetchProfile();
        } catch (e) {
            console.error("Failed to update personal info", e);
        }
    };

    const updateAcademicSummary = async (updates) => {
        setAcademicSummary(prev => ({ ...prev, ...updates }));
        try {
            await api.updateProfile({
                college: updates.college,
                branch: updates.branch,
                enrollment_no: updates.enrollmentNo,
                cgpa: updates.cgpa ? parseFloat(updates.cgpa.split('/')[0]) : null,
                passing_year: updates.passingYear ? parseInt(updates.passingYear) : null,
                current_year: updates.currentYear,
            });
            fetchProfile();
        } catch (e) {
            console.error("Failed to update academic summary", e);
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
            {children}
        </ProfileContext.Provider>
    );
};
