import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../core/context/AppContext';
import { ProfileProvider, useProfile } from '../context/ProfileContext';
import { ProfileSummaryCard } from '../components/ProfileSummaryCard';
import { PersonalInfoForm } from '../components/PersonalInfoForm';
import { AcademicDetailsForm } from '../components/AcademicDetailsForm';
import { SocialLinksForm } from '../components/SocialLinksForm';
import { api } from '../../../core/services/api';

const ProfilePageContent = () => {
    const { currentUser, getProfile, data } = useApp();
    const { academicSummary } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('Personal Info');
    const [languages, setLanguages] = useState(['English', 'Hindi']);
    const [profile, setProfile] = useState(null);
    const availableLanguages = ['English', 'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati'];
    
    // School Details States
    const [school10, setSchool10] = useState("");
    const [year10, setYear10] = useState("2019");
    const [school12, setSchool12] = useState("");
    const [year12, setYear12] = useState("2021");
    const [id10, setId10] = useState(null);
    const [id12, setId12] = useState(null);

    const { updateAcademicSummary } = useProfile();

    // College Local States for editing
    const [colName, setColName] = useState("");
    const [colCgpa, setColCgpa] = useState("");
    const [colBranch, setColBranch] = useState("");
    const [colRoll, setColRoll] = useState("");
    const [colPassing, setColPassing] = useState("");
    const [colCurrent, setColCurrent] = useState("");

    // Sync profile to local states
    useEffect(() => {
        if (profile) {
            setColName(profile.college || "");
            setColCgpa(profile.cgpa ? String(profile.cgpa) : "");
            setColBranch(profile.branch || "");
            setColRoll(profile.enrollment_no || "");
            setColPassing(profile.passing_year ? String(profile.passing_year) : "");
            setColCurrent(profile.current_year || "");
        }
    }, [profile]);

    const handleSaveEducation = async () => {
        setIsEditing(false);
        try {
            // 1. Save College details
            await updateAcademicSummary({
                college: colName,
                cgpa: colCgpa,
                branch: colBranch,
                enrollmentNo: colRoll,
                passingYear: colPassing,
                currentYear: colCurrent
            });

            // 2. Save 10th Record
            const data10 = {
                course: '10th Examination',
                institution: school10,
                start_year: parseInt(year10) - 1 || 2018,
                end_year: parseInt(year10) || 2019,
                score: parseFloat(marks10.percentage) || 0,
                score_type: 'percent'
            };
            if (id10) {
                await api.updateAcademicRecord(id10, data10);
            } else {
                const res = await api.createAcademicRecord(data10);
                setId10(res.data.id);
            }

            // 3. Save 12th Record
            const data12 = {
                course: '12th Examination',
                institution: school12,
                start_year: parseInt(year12) - 2 || 2019,
                end_year: parseInt(year12) || 2021,
                score: parseFloat(marks12.percentage) || 0,
                score_type: 'percent'
            };
            if (id12) {
                await api.updateAcademicRecord(id12, data12);
            } else {
                const res = await api.createAcademicRecord(data12);
                setId12(res.data.id);
            }

            // Reload profile data to sync table and metrics
            const updatedProfile = await getProfile();
            setProfile(updatedProfile);
        } catch (e) {
            console.error("Failed to save education details", e);
        }
    };

    const handleSaveAcademicHistory = async () => {
        if (isAcademicEditing) {
            try {
                await Promise.all(academicDetails.map(detail => {
                    const years = String(detail.year).split('-');
                    const startYear = parseInt(years[0]) || detail.start_year || 2020;
                    const endYear = parseInt(years[1]) || detail.end_year || 2024;
                    const cleanScore = parseFloat(String(detail.score).replace(/[^0-9.]/g, '')) || detail.raw_score || 0;
                    
                    const recordPayload = {
                        course: detail.course,
                        institution: detail.institution,
                        start_year: startYear,
                        end_year: endYear,
                        score: cleanScore,
                        score_type: detail.score_type || (String(detail.course).toLowerCase().includes('10') || String(detail.course).toLowerCase().includes('12') ? 'percent' : 'cgpa')
                    };

                    if (String(detail.id).startsWith('temp-')) {
                        return api.createAcademicRecord(recordPayload);
                    } else {
                        return api.updateAcademicRecord(detail.id, recordPayload);
                    }
                }));
                // Reload profile data to refresh list and score
                const updatedProfile = await getProfile();
                setProfile(updatedProfile);
            } catch (e) {
                console.error("Failed to save academic records", e);
            }
        }
        setIsAcademicEditing(!isAcademicEditing);
    };

    const handleSaveAbout = async () => {
        if (isAboutEditing) {
            try {
                await api.updateProfile({ about_me: aboutText });
            } catch (e) {
                console.error("Failed to save about details", e);
            }
        }
        setIsAboutEditing(!isAboutEditing);
    };

    const handleSaveSkills = async () => {
        setIsEditing(false);
        try {
            const currentProfile = await getProfile();
            const dbSkills = currentProfile.skills || [];
            
            const uiIds = skillsList.map(s => String(s.id));
            const toDelete = dbSkills.filter(s => !uiIds.includes(String(s.id)));
            await Promise.all(toDelete.map(s => api.deleteSkill(s.id)));

            await Promise.all(skillsList.map(skill => {
                const proficiencyMap = { 'Expert': 90, 'Advance': 75, 'Beginner': 40, 'Intermediate': 60, 'Proficient': 70 };
                const proficiencyValue = proficiencyMap[skill.proficiency] || 50;
                
                const payload = {
                    name: skill.name,
                    proficiency: proficiencyValue
                };
                
                if (String(skill.id).startsWith('temp-') || isNaN(parseInt(skill.id))) {
                    return api.createSkill(payload);
                } else {
                    return api.updateSkill(skill.id, payload);
                }
            }));
            
            const updatedProfile = await getProfile();
            setProfile(updatedProfile);
        } catch (e) {
            console.error("Failed to save skills", e);
        }
    };

    const handleSaveProjects = async () => {
        try {
            const currentProfile = await getProfile();
            const dbProjects = currentProfile.projects || [];

            // Delete removed projects
            const uiIds = projectsList
                .filter(p => !String(p.id).startsWith("temp-"))
                .map(p => Number(p.id));

            const toDelete = dbProjects.filter(p => !uiIds.includes(p.id));

            await Promise.all(
                toDelete.map(p => api.deleteProject(p.id))
            );

            // Create / Update
            await Promise.all(
                projectsList.map(project => {
                    const payload = {
                        title: project.name,
                        description: project.description,
                        project_url: project.url,
                        github_url: project.url,
                    };

                    if (String(project.id).startsWith("temp-")) {
                        return api.createProject(payload);
                    }

                    return api.updateProject(project.id, payload);
                })
            );

            const updatedProfile = await getProfile();

            setProfile(updatedProfile);

            setProjectsList(
                updatedProfile.projects.map(p => ({
                    id: p.id,
                    name: p.title,
                    url: p.project_url || p.github_url || "",
                    description: p.description || "",
                }))
            );

            setIsEditing(false);

        } catch (e) {
            console.error("Failed to save projects", e);
        }
    };

    const handleSaveCertifications = async () => {
        setIsEditing(false);
        try {
            const currentProfile = await getProfile();
            const dbCerts = currentProfile.certifications || [];
            
            const uiIds = certificationsList.map(c => String(c.id));
            const toDelete = dbCerts.filter(c => !uiIds.includes(String(c.id)));
            await Promise.all(toDelete.map(c => api.deleteCertification(c.id)));

            await Promise.all(certificationsList.map(cert => {
                const payload = {
                    title: cert.name,
                    issuer: cert.no || 'Unknown',
                    credential_url: cert.no ? 'http://example.com' : ''
                };
                
                if (String(cert.id).startsWith('temp-') || isNaN(parseInt(cert.id))) {
                    return api.createCertification(payload);
                } else {
                    return api.updateCertification(cert.id, payload);
                }
            }));
            
            const updatedProfile = await getProfile();
            setProfile(updatedProfile);
        } catch (e) {
            console.error("Failed to save certifications", e);
        }
    };

    const handleCompleteProfileClick = () => {
        const sections = profile?.profile_completion?.sections || {};
        if (sections.personal_information < 100) {
            setActiveTab('Personal Info');
        } else if (sections.academic_details < 100) {
            setActiveTab('Education');
        } else if (sections.skills < 100) {
            setActiveTab('Skills');
        } else if (sections.projects < 100) {
            setActiveTab('Projects');
        } else if (sections.certifications < 100) {
            setActiveTab('Certifications');
        } else if (sections.resume < 100) {
            setActiveTab('Resume');
        } else if (sections.social_links < 100) {
            setActiveTab('Social Links');
        }
        setIsEditing(true);
        const tabsContainer = document.querySelector('.custom-scrollbar');
        if (tabsContainer) {
            tabsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleViewAllSkills = (e) => {
        e.preventDefault();
        setActiveTab('Skills');
        const tabsContainer = document.querySelector('.custom-scrollbar');
        if (tabsContainer) {
            tabsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleAddMoreSkillsClick = () => {
        setActiveTab('Skills');
        setIsEditing(true);
        addSkillRow();
        const tabsContainer = document.querySelector('.custom-scrollbar');
        if (tabsContainer) {
            tabsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Additional Edit States
    const [isAcademicEditing, setIsAcademicEditing] = useState(false);
    const [academicDetails, setAcademicDetails] = useState([]);
    const [isAboutEditing, setIsAboutEditing] = useState(false);
    const [aboutText, setAboutText] = useState("A motivated CS student.");
    
    // Marks States for Auto-calculation
    const [marks10, setMarks10] = useState({ obtained: 0, total: 100, percentage: 0 });
    const [marks12, setMarks12] = useState({ obtained: 0, total: 100, percentage: 0 });

    const [skillsList, setSkillsList] = useState([
        { id: 1, name: 'Python', proficiency: 'Expert' },
        { id: 2, name: 'Machine Learning', proficiency: 'Advance' },
    ]);

    const handleSkillChange = (id, field, value) => {
        setSkillsList(skillsList.map(skill => skill.id === id ? { ...skill, [field]: value } : skill));
    };

    const addSkillRow = () => {
        setSkillsList([
            ...skillsList,
            {
                id: `temp-${Date.now()}`,
                name: '',
                proficiency: 'Beginner'
            }
        ]);
    };
    
    const removeSkillRow = (id) => {
        setSkillsList(skillsList.filter(skill => skill.id !== id));
    };

    // Projects States
    const [projectsList, setProjectsList] = useState([
        { id: 1, name: 'Campus Placement Portal', url: 'https://github.com/project', description: 'A comprehensive web application for managing university placements, built with React and Node.js.' },
    ]);

    const handleProjectChange = (id, field, value) => {
        setProjectsList(projectsList.map(project => project.id === id ? { ...project, [field]: value } : project));
    };

    const addProjectRow = () => {
        setProjectsList([
            ...projectsList,
            {
                id: `temp-${Date.now()}`,
                name: '',
                url: '',
                description: ''
            }
        ]);
    };
    
    const removeProjectRow = (id) => {
        setProjectsList(projectsList.filter(project => project.id !== id));
    };

    // Certifications States
    const [certificationsList, setCertificationsList] = useState([
        { id: 1, name: 'AWS Certified Cloud Practitioner', no: 'AWS-123456', validity: '2023 - 2026' },
    ]);

    // Social Links States
    const [isSocialEditing, setIsSocialEditing] = useState(false);
    const [socialLinks, setSocialLinks] = useState({
        gmail: 'rahul.sharma@example.com',
        github: 'github.com/rahulsharma',
        discord: 'rahul#1234',
        x: 'x.com/rahulsharma',
        linkedin: 'linkedin.com/in/rahulsharma',
    });

    const handleSocialChange = (platform, value) => {
        setSocialLinks(prev => ({ ...prev, [platform]: value }));
    };

    const handleCertificationChange = (id, field, value) => {
        setCertificationsList(certificationsList.map(cert => cert.id === id ? { ...cert, [field]: value } : cert));
    };

    const addCertificationRow = () => {
        setCertificationsList([...certificationsList, { id: `temp-${Date.now()}`, name: '', no: '', validity: '' }]);
    };
    
    const removeCertificationRow = (id) => {
        setCertificationsList(certificationsList.filter(cert => cert.id !== id));
    };

    const handleMarksChange = (type, field, val) => {
        const numValue = val === '' ? '' : parseFloat(val);
        if (type === '10th') {
            const newState = { ...marks10, [field]: val }; // Keep string to allow typing decimals or empty
            if (field === 'obtained' || field === 'total') {
                const o = parseFloat(newState.obtained) || 0;
                const t = parseFloat(newState.total) || 0;
                newState.percentage = t > 0 ? ((o / t) * 100).toFixed(2) : 0;
            }
            setMarks10(newState);
        } else {
            const newState = { ...marks12, [field]: val };
            if (field === 'obtained' || field === 'total') {
                const o = parseFloat(newState.obtained) || 0;
                const t = parseFloat(newState.total) || 0;
                newState.percentage = t > 0 ? ((o / t) * 100).toFixed(2) : 0;
            }
            setMarks12(newState);
        }
    };

    // File upload states
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || data?.user?.avatar || 'https://via.placeholder.com/150');
    const [resumeFile, setResumeFile] = useState(null);
    const avatarInputRef = useRef(null);
    const resumeInputRef = useRef(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profileData = await getProfile();
                console.log("PROFILE DATA:", profileData);
                setProfile(profileData);
                
                if (profileData) {
                    if (profileData.about_me) {
                        setAboutText(profileData.about_me);
                    }
                    
                    // Map academic records (10th/12th)
                    const rec10 = profileData.academic_records?.find(r => r.course.includes("10"));
                    if (rec10) {
                        setId10(rec10.id);
                        setSchool10(rec10.institution || "");
                        setYear10(String(rec10.end_year) || "2019");
                        setMarks10({
                            obtained: rec10.score,
                            total: 100,
                            percentage: rec10.score
                        });
                    }
                    const rec12 = profileData.academic_records?.find(r => r.course.includes("12"));
                    if (rec12) {
                        setId12(rec12.id);
                        setSchool12(rec12.institution || "");
                        setYear12(String(rec12.end_year) || "2021");
                        setMarks12({
                            obtained: rec12.score,
                            total: 100,
                            percentage: rec12.score
                        });
                    }

                    // Map academic details list for table
                    if (profileData.academic_records && profileData.academic_records.length > 0) {
                        setAcademicDetails(profileData.academic_records.map(r => ({
                            id: r.id,
                            course: r.course,
                            institution: r.institution,
                            year: `${r.start_year} - ${r.end_year}`,
                            score: r.score_type === 'percent' ? `${r.score} %` : `${r.score} / 10`,
                            start_year: r.start_year,
                            end_year: r.end_year,
                            score_type: r.score_type,
                            raw_score: r.score
                        })));
                    } else {
                        setAcademicDetails([]);
                    }

                    // Map skills list
                    if (profileData.skills && profileData.skills.length > 0) {
                        setSkillsList(profileData.skills.map(s => ({
                            id: s.id,
                            name: s.name,
                            proficiency: s.proficiency >= 85 ? 'Expert' : s.proficiency >= 60 ? 'Advance' : 'Beginner'
                        })));
                    } else {
                        setSkillsList([]);
                    }

                    // Map projects list
                    if (profileData.projects && profileData.projects.length > 0) {
                        setProjectsList(profileData.projects.map(p => ({
                            id: p.id,
                            name: p.title,
                            url: p.project_url || p.github_url || '',
                            description: p.description || ''
                        })));
                    } else {
                        setProjectsList([]);
                    }

                    // Map certifications list
                    if (profileData.certifications && profileData.certifications.length > 0) {
                        setCertificationsList(profileData.certifications.map(c => ({
                            id: c.id,
                            name: c.title,
                            no: c.credential_url ? 'Credential Link' : 'N/A',
                            validity: c.issue_date || 'N/A'
                        })));
                    } else {
                        setCertificationsList([]);
                    }
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            }
        };
        loadProfile();
    }, []);

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleResumeUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
        }
    };

    const tabs = ['Personal Info', 'Education', 'Skills', 'Projects', 'Certifications', 'Resume', 'Social Links'];
    const getTabIcon = (tab) => {
        switch(tab) {
            case 'Personal Info': return 'fa-user';
            case 'Education': return 'fa-graduation-cap';
            case 'Skills': return 'fa-bolt';
            case 'Projects': return 'fa-folder';
            case 'Certifications': return 'fa-certificate';
            case 'Resume': return 'fa-file-lines';
            case 'Social Links': return 'fa-link';
            default: return 'fa-circle';
        }
    };

    return (
        <div className="p-4 sm:p-6 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
                    <div className="text-sm text-gray-500">Dashboard <i className="fa-solid fa-chevron-right text-[10px] mx-1"></i> Profile</div>
                </div>
                <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-2"
                >
                    <i className="fa-solid fa-pen text-xs"></i> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="xl:col-span-2 space-y-6">
                    
                    {/* User Summary Card */}
                    <ProfileSummaryCard isEditing={isEditing} />

                    {/* Tabs & Content */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar">
                            {tabs.map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                                >
                                    <i className={`fa-solid ${getTabIcon(tab)} ${activeTab === tab ? 'text-blue-600' : 'text-gray-400'}`}></i> {tab}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 sm:p-8">
                            {activeTab === 'Personal Info' && (
                                <PersonalInfoForm isEditing={isEditing} setIsEditing={setIsEditing} />
                            )}
                            {activeTab === 'Education' && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Education Details</h3>
                                    
                                    <div className="space-y-8">
                                        {/* 10th Examination */}
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">1. 10th Examination</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                                <InputField label="School Name" value={school10} onChange={(val) => setSchool10(val)} isEditing={isEditing} />
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Marks Obtained of Total Marks</label>
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="number" 
                                                            className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`} 
                                                            disabled={!isEditing} 
                                                            value={marks10.obtained} 
                                                            onChange={(e) => handleMarksChange('10th', 'obtained', e.target.value)} 
                                                        />
                                                        <span className="text-sm text-gray-500 font-medium">of</span>
                                                        <input 
                                                            type="number" 
                                                            className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`} 
                                                            disabled={!isEditing} 
                                                            value={marks10.total} 
                                                            onChange={(e) => handleMarksChange('10th', 'total', e.target.value)} 
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Percentage</label>
                                                    <input 
                                                        type="number" 
                                                        className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`} 
                                                        disabled={!isEditing} 
                                                        value={marks10.percentage} 
                                                        onChange={(e) => handleMarksChange('10th', 'percentage', e.target.value)} 
                                                    />
                                                </div>
                                                <SelectField label="Passing Year" value={year10} onChange={(val) => setYear10(val)} options={['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']} isEditing={isEditing} />
                                            </div>
                                        </div>

                                        {/* 12th Examination */}
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">2. 12th Examination</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                                <InputField label="School Name" value={school12} onChange={(val) => setSchool12(val)} isEditing={isEditing} />
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Marks Obtained of Total Marks</label>
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="number" 
                                                            className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`} 
                                                            disabled={!isEditing} 
                                                            value={marks12.obtained} 
                                                            onChange={(e) => handleMarksChange('12th', 'obtained', e.target.value)} 
                                                        />
                                                        <span className="text-sm text-gray-500 font-medium">of</span>
                                                        <input 
                                                            type="number" 
                                                            className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`} 
                                                            disabled={!isEditing} 
                                                            value={marks12.total} 
                                                            onChange={(e) => handleMarksChange('12th', 'total', e.target.value)} 
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Percentage</label>
                                                    <input 
                                                        type="number" 
                                                        className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`} 
                                                        disabled={!isEditing} 
                                                        value={marks12.percentage} 
                                                        onChange={(e) => handleMarksChange('12th', 'percentage', e.target.value)} 
                                                    />
                                                </div>
                                                <SelectField label="Passing Year" value={year12} onChange={(val) => setYear12(val)} options={['2020', '2021', '2022', '2023', '2024', '2025', '2026']} isEditing={isEditing} />
                                            </div>
                                        </div>

                                        {/* College */}
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">3. College</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                                <InputField label="Name of College" value={colName} onChange={(val) => setColName(val)} isEditing={isEditing} />
                                                <InputField label="CGPA" value={colCgpa} onChange={(val) => setColCgpa(val)} type="text" isEditing={isEditing} />
                                                <InputField label="Branch" value={colBranch} onChange={(val) => setColBranch(val)} isEditing={isEditing} />
                                                <InputField label="Roll No" value={colRoll} onChange={(val) => setColRoll(val)} isEditing={isEditing} />
                                                <SelectField label="Passing Year" value={colPassing} onChange={(val) => setColPassing(val)} options={['2023', '2024', '2025', '2026', '2027', '2028']} isEditing={isEditing} />
                                                <SelectField label="Current Year" value={colCurrent} onChange={(val) => setColCurrent(val)} options={['1st Year', '2nd Year', '3rd Year', 'Final Year (7th Sem)', 'Final Year (8th Sem)', 'Graduated']} isEditing={isEditing} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isEditing && (
                                        <div className="mt-8 flex justify-end">
                                            <button onClick={handleSaveEducation} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition">
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Skills' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Your Skills</h3>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2">
                                                <i className="fa-solid fa-pen"></i> Edit
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-12 gap-4 hidden sm:grid">
                                            <div className="col-span-6 text-sm font-medium text-gray-700">Skill Name</div>
                                            <div className="col-span-5 text-sm font-medium text-gray-700">Proficiency Level</div>
                                        </div>
                                        {skillsList.map((skill) => (
                                            <div key={skill.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                                <div className="sm:col-span-6">
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. React.js"
                                                        className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`}
                                                        disabled={!isEditing}
                                                        value={skill.name}
                                                        onChange={(e) => handleSkillChange(skill.id, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="sm:col-span-5 relative">
                                                    <select 
                                                        className={`w-full p-2.5 border rounded-lg text-sm appearance-none transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`}
                                                        disabled={!isEditing}
                                                        value={skill.proficiency}
                                                        onChange={(e) => handleSkillChange(skill.id, 'proficiency', e.target.value)}
                                                    >
                                                        <option value="Beginner">Beginner</option>
                                                        <option value="Intermediate">Intermediate</option>
                                                        <option value="Proficient">Proficient</option>
                                                        <option value="Advance">Advance</option>
                                                        <option value="Expert">Expert</option>
                                                    </select>
                                                    <i className={`fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${isEditing ? 'text-gray-500' : 'text-gray-400'}`}></i>
                                                </div>
                                                <div className="sm:col-span-1 flex justify-end sm:justify-center">
                                                    {isEditing && (
                                                        <button 
                                                            onClick={() => removeSkillRow(skill.id)}
                                                            className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition"
                                                            title="Remove skill"
                                                        >
                                                            <i className="fa-solid fa-trash-can text-sm"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {isEditing && (
                                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 pt-6">
                                            <button 
                                                onClick={addSkillRow} 
                                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2"
                                            >
                                                <i className="fa-solid fa-plus"></i> Add Another Skill
                                            </button>
                                            <button onClick={handleSaveSkills} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition">
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {activeTab === 'Projects' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Your Projects</h3>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2">
                                                <i className="fa-solid fa-pen"></i> Edit
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        {projectsList.map((project) => (
                                            <div key={project.id} className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 relative group transition-all hover:shadow-sm hover:border-gray-200">
                                                {isEditing && (
                                                    <button 
                                                        onClick={() => removeProjectRow(project.id)}
                                                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 flex items-center justify-center transition shadow-sm z-10"
                                                        title="Remove project"
                                                    >
                                                        <i className="fa-solid fa-xmark text-sm"></i>
                                                    </button>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="e.g. E-Commerce Platform"
                                                            className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-transparent text-gray-800 font-medium cursor-not-allowed'}`}
                                                            disabled={!isEditing}
                                                            value={project.name}
                                                            onChange={(e) => handleProjectChange(project.id, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">URL / Link</label>
                                                        <input 
                                                            type="url" 
                                                            placeholder="e.g. https://github.com/..."
                                                            className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-transparent text-blue-600 hover:underline cursor-not-allowed'}`}
                                                            disabled={!isEditing}
                                                            value={project.url}
                                                            onChange={(e) => handleProjectChange(project.id, 'url', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                                    <textarea 
                                                        placeholder="Briefly describe what this project does and the technologies used..."
                                                        className={`w-full p-3 border rounded-lg text-sm transition-colors min-h-[100px] ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-transparent text-gray-600 cursor-not-allowed resize-none'}`}
                                                        disabled={!isEditing}
                                                        value={project.description}
                                                        onChange={(e) => handleProjectChange(project.id, 'description', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {isEditing && (
                                        <div className="mt-8 flex flex-col items-center">
                                            <button 
                                                onClick={addProjectRow} 
                                                className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition shadow-sm mb-6 border border-blue-100"
                                                title="Add New Project"
                                            >
                                                <i className="fa-solid fa-plus text-xl"></i>
                                            </button>
                                            
                                            <div className="w-full flex justify-end border-t border-gray-100 pt-6">
                                                <button onClick={handleSaveProjects} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition">
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Certifications' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Your Certifications</h3>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2">
                                                <i className="fa-solid fa-pen"></i> Edit
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        {certificationsList.map((cert) => (
                                            <div key={cert.id} className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 relative group transition-all hover:shadow-sm hover:border-gray-200">
                                                {isEditing && (
                                                    <button 
                                                        onClick={() => removeCertificationRow(cert.id)}
                                                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 flex items-center justify-center transition shadow-sm z-10"
                                                        title="Remove certification"
                                                    >
                                                        <i className="fa-solid fa-xmark text-sm"></i>
                                                    </button>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Certificate Name</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="e.g. AWS Certified..."
                                                            className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-transparent text-gray-800 font-medium cursor-not-allowed'}`}
                                                            disabled={!isEditing}
                                                            value={cert.name}
                                                            onChange={(e) => handleCertificationChange(cert.id, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Certification No</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="e.g. AWS-123456"
                                                            className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-transparent text-gray-800 cursor-not-allowed'}`}
                                                            disabled={!isEditing}
                                                            value={cert.no}
                                                            onChange={(e) => handleCertificationChange(cert.id, 'no', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Validity Time</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="e.g. 2023 - 2026"
                                                            className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none' : 'border-gray-200 bg-transparent text-gray-800 cursor-not-allowed'}`}
                                                            disabled={!isEditing}
                                                            value={cert.validity}
                                                            onChange={(e) => handleCertificationChange(cert.id, 'validity', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {isEditing && (
                                        <div className="mt-8 flex flex-col items-center">
                                            <button 
                                                onClick={addCertificationRow} 
                                                className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition shadow-sm mb-6 border border-blue-100"
                                                title="Add New Certification"
                                            >
                                                <i className="fa-solid fa-plus text-xl"></i>
                                            </button>
                                            
                                            <div className="w-full flex justify-end border-t border-gray-100 pt-6">
                                                <button onClick={handleSaveCertifications} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition">
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Resume' && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-10 max-w-4xl mx-auto">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-bold text-gray-900">Your Resume</h3>
                                    </div>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                            <i className="fa-solid fa-file-pdf text-3xl"></i>
                                        </div>
                                        {resumeFile ? (
                                            <div className="space-y-4">
                                                <p className="text-gray-900 font-bold text-xl">{resumeFile.name}</p>
                                                <p className="text-sm text-gray-500 font-medium">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Uploaded just now</p>
                                                <div className="flex justify-center gap-4 mt-8">
                                                    <button className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-8 py-3 rounded-lg text-sm font-bold transition flex items-center gap-2 border border-blue-100 shadow-sm">
                                                        <i className="fa-regular fa-eye"></i> View Resume
                                                    </button>
                                                    <label className="text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-8 py-3 rounded-lg text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-sm">
                                                        <i className="fa-solid fa-cloud-arrow-up"></i> Update New File
                                                        <input 
                                                            type="file" 
                                                            accept=".pdf" 
                                                            className="hidden" 
                                                            onChange={handleResumeUpload}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-gray-900 font-bold text-xl mb-3">Upload your resume</p>
                                                <p className="text-base text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">Ensure your resume is up-to-date to increase your chances of getting shortlisted. PDF format only (Max 5MB).</p>
                                                <label className="bg-blue-600 text-white px-10 py-3 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition cursor-pointer inline-flex items-center gap-2">
                                                    <i className="fa-solid fa-cloud-arrow-up text-lg"></i> Select PDF File
                                                    <input 
                                                        type="file" 
                                                        accept=".pdf" 
                                                        className="hidden" 
                                                        onChange={handleResumeUpload}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Social Links' && (
                                <SocialLinksForm />
                            )}
                        </div>
                    </div>

                    {/* Bottom Sections: Academic Details & About Me */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                        <AcademicDetailsForm />
                        
                        <div className="flex justify-between items-center mb-6 mt-8 border-t border-gray-100 pt-8">
                            <h3 className="text-lg font-bold text-gray-900">Academic History</h3>
                            <button 
                                onClick={handleSaveAcademicHistory}
                                className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 border border-blue-100"
                            >
                                {isAcademicEditing ? <><i className="fa-solid fa-check"></i> Save</> : <><i className="fa-solid fa-pen"></i> Edit</>}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-gray-500 border-b border-gray-200">
                                    <tr>
                                        <th className="pb-3 font-medium">Course</th>
                                        <th className="pb-3 font-medium">Institution</th>
                                        <th className="pb-3 font-medium w-32">Year</th>
                                        <th className="pb-3 font-medium text-right w-32">CGPA / %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {academicDetails.map((detail, index) => (
                                        <tr key={detail.id}>
                                            <td className="py-4 font-medium text-gray-900">
                                                {isAcademicEditing ? (
                                                    <input 
                                                        type="text" 
                                                        placeholder="Course name (e.g. 10th)"
                                                        className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                        value={detail.course} 
                                                        onChange={(e) => {
                                                            const newDetails = [...academicDetails];
                                                            newDetails[index].course = e.target.value;
                                                            setAcademicDetails(newDetails);
                                                        }} 
                                                    />
                                                ) : detail.course}
                                            </td>
                                            <td className="py-4 text-gray-600">
                                                {isAcademicEditing ? (
                                                    <input 
                                                        type="text" 
                                                        className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                        value={detail.institution} 
                                                        onChange={(e) => {
                                                            const newDetails = [...academicDetails];
                                                            newDetails[index].institution = e.target.value;
                                                            setAcademicDetails(newDetails);
                                                        }} 
                                                    />
                                                ) : detail.institution}
                                            </td>
                                            <td className="py-4 text-gray-600">
                                                {isAcademicEditing ? (
                                                    <input 
                                                        type="text" 
                                                        className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                        value={detail.year} 
                                                        onChange={(e) => {
                                                            const newDetails = [...academicDetails];
                                                            newDetails[index].year = e.target.value;
                                                            setAcademicDetails(newDetails);
                                                        }} 
                                                    />
                                                ) : detail.year}
                                            </td>
                                            <td className="py-4 text-right font-medium text-gray-900">
                                                {isAcademicEditing ? (
                                                    <input 
                                                        type="text" 
                                                        className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-right bg-white"
                                                        value={detail.score} 
                                                        onChange={(e) => {
                                                            const newDetails = [...academicDetails];
                                                            newDetails[index].score = e.target.value;
                                                            setAcademicDetails(newDetails);
                                                        }} 
                                                    />
                                                ) : detail.score}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {isAcademicEditing && (
                            <button 
                                onClick={() => {
                                    setAcademicDetails([
                                        ...academicDetails,
                                        { id: `temp-${Date.now()}`, course: '', institution: '', year: '', score: '', isNew: true }
                                    ]);
                                }}
                                className="mt-4 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 border border-blue-100"
                            >
                                <i className="fa-solid fa-plus"></i> Add Education Record
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">About Me</h3>
                            <button 
                                onClick={handleSaveAbout}
                                className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 border border-blue-100"
                            >
                                {isAboutEditing ? <><i className="fa-solid fa-check"></i> Save</> : <><i className="fa-solid fa-pen"></i> Edit</>}
                            </button>
                        </div>
                        {isAboutEditing ? (
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 min-h-[120px]"
                                value={aboutText}
                                onChange={(e) => setAboutText(e.target.value)}
                            />
                        ) : (
                            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl whitespace-pre-line">
                                {aboutText}
                            </p>
                        )}
                    </div>

                </div>

                {/* Right Column */}
                <div className="xl:col-span-1 space-y-6">
                    
                    {/* Profile Completion */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                        <h3 className="font-bold text-gray-900 mb-8">Profile Completion</h3>
                        <div className="flex justify-center mb-8">
                            <div className="relative w-36 h-36">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="72" cy="72" r="60" stroke="#F3F4F6" strokeWidth="12" fill="none" />
                                    <circle cx="72" cy="72" r="60" stroke="#2563EB" strokeWidth="12" fill="none" strokeDasharray={2 * Math.PI * 60} strokeDashoffset={2 * Math.PI * 60 * (1 - (profile?.profile_completion?.overall_percent || 0) / 100)} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-blue-600">{profile?.profile_completion?.overall_percent || 0}%</span>
                                    <span className="text-[10px] text-gray-500 font-medium">Completed</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3.5 text-[13px] font-medium">
                            <CompletionItem label="Personal Information" percent={`${profile?.profile_completion?.sections?.personal_information || 0}%`} color={profile?.profile_completion?.sections?.personal_information === 100 ? "text-green-500" : "text-orange-500"} />
                            <CompletionItem label="Academic Details" percent={`${profile?.profile_completion?.sections?.academic_details || 0}%`} color={profile?.profile_completion?.sections?.academic_details === 100 ? "text-green-500" : "text-orange-500"} />
                            <CompletionItem label="Skills" percent={`${profile?.profile_completion?.sections?.skills || 0}%`} color={profile?.profile_completion?.sections?.skills === 100 ? "text-green-500" : "text-orange-500"} />
                            <CompletionItem label="Projects" percent={`${profile?.profile_completion?.sections?.projects || 0}%`} color={profile?.profile_completion?.sections?.projects === 100 ? "text-green-500" : "text-orange-500"} />
                            <CompletionItem label="Certifications" percent={`${profile?.profile_completion?.sections?.certifications || 0}%`} color={profile?.profile_completion?.sections?.certifications === 100 ? "text-green-500" : "text-orange-500"} />
                            <CompletionItem label="Resume" percent={`${profile?.profile_completion?.sections?.resume || 0}%`} color={profile?.profile_completion?.sections?.resume === 100 ? "text-green-500" : "text-orange-500"} />
                            <CompletionItem label="Social Links" percent={`${profile?.profile_completion?.sections?.social_links || 0}%`} color={profile?.profile_completion?.sections?.social_links === 100 ? "text-green-500" : "text-orange-500"} />
                        </div>
                        <button onClick={handleCompleteProfileClick} className="w-full mt-8 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-lg text-sm transition">
                            Complete Profile
                        </button>
                    </div>

                    {/* Top Skills */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Top Skills</h3>
                            <a href="#" onClick={handleViewAllSkills} className="text-xs font-medium text-blue-600 hover:underline">View all</a>
                        </div>
                        <div className="space-y-5">
                             {profile?.skills && profile.skills.length > 0 ? (
                                 profile.skills.slice(0, 5).map(skill => (
                                     <SkillProgress key={skill.id} name={skill.name} percent={skill.proficiency} color="bg-blue-500" />
                                 ))
                             ) : (
                                 <p className="text-sm text-gray-400">No skills added yet.</p>
                             )}
                        </div>
                        <button onClick={handleAddMoreSkillsClick} className="w-full mt-8 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-lg text-sm transition">
                            Add More Skills
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

/* Helper Components */
const InputField = ({ label, defaultValue, value, onChange, type = "text", isEditing }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input 
            type={type} 
            className={`w-full p-2.5 border rounded-lg text-sm transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`}
            disabled={!isEditing} 
            defaultValue={defaultValue} 
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        />
    </div>
);

const SelectField = ({ label, defaultValue, value, onChange, options, isEditing }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <select 
                className={`w-full p-2.5 border rounded-lg text-sm appearance-none transition-colors ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none' : 'border-gray-200 bg-gray-50/50 text-gray-600 cursor-not-allowed'}`}
                disabled={!isEditing}
                defaultValue={defaultValue}
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <i className={`fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${isEditing ? 'text-gray-500' : 'text-gray-400'}`}></i>
        </div>
    </div>
);

const CompletionItem = ({ label, percent, color }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${color === 'text-green-500' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span className="text-gray-700">{label}</span>
        </div>
        <span className="text-gray-400">{percent}</span>
    </div>
);

const SkillProgress = ({ name, percent, color }) => (
    <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-gray-700 w-28 truncate">{name}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
            <div className={`${color} h-1.5 rounded-full`} style={{ width: `${percent}%` }}></div>
        </div>
        <span className="text-xs font-bold text-gray-900 w-8 text-right">{percent}%</span>
    </div>
);

export const ProfilePage = () => {
    return (
        <ProfileProvider>
            <ProfilePageContent />
        </ProfileProvider>
    );
};
