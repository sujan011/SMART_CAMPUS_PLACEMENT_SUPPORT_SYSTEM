import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../core/services/api';
import generatePDF, { usePDF } from "react-to-pdf";

const THEMES = ['#2563eb', '#16a34a', '#0f766e', '#be123c', '#334155', '#ea580c'];

const TEMPLATE_SCHEMAS = {
    template1: ['personal', 'education', 'expertise', 'rewards', 'experience', 'references'], // Dani
    template2: ['personal', 'profile', 'experience', 'education', 'skills'], // Richard
    template3: ['personal', 'profile', 'experience', 'education', 'skills', 'languages'], // Lucia
    template4: ['personal', 'summary', 'education', 'skills', 'languages', 'experience', 'references'], // Emaa
    template5: ['personal', 'profile', 'education', 'expertise', 'languages', 'experience', 'references'], // Olivia
    template6: ['personal', 'summary', 'education', 'skills', 'experience', 'projects'] // Classic
};

const TEMPLATE_NAMES = {
    template1: 'Dani',
    template2: 'Richard',
    template3: 'Lucia',
    template4: 'Emaa',
    template5: 'Olivia',
    template6: 'Classic'
};

const ImageUpload = ({ value, onChange }) => {
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        processFile(file);
    };
    const handleDragOver = (e) => e.preventDefault();
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };
    const processFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => onChange(e.target.result);
            reader.readAsDataURL(file);
        }
    };
    return (
        <div 
            onDrop={handleDrop} 
            onDragOver={handleDragOver} 
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-colors bg-white relative cursor-pointer"
        >
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {value ? (
                <div className="flex flex-col items-center">
                    <img src={value} alt="Profile" className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-200 shadow-sm" />
                    <span className="text-xs text-blue-600 font-medium hover:underline">Click or drag to replace image</span>
                </div>
            ) : (
                <>
                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-400 mb-2"></i>
                    <span className="text-sm font-medium text-gray-700">Drag & Drop or Click to Upload</span>
                    <span className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WEBP</span>
                </>
            )}
        </div>
    );
};

export const ResumeBuilderPage = () => {
    const navigate = useNavigate();
    const [selectedTemplate, setSelectedTemplate] = useState('template1');
    const [activeSection, setActiveSection] = useState('personal');
    const [themeColor, setThemeColor] = useState(THEMES[0]);
    
    const [resumeData, setResumeData] = useState({
        personal: { 
            name: 'Dani Villanueva', 
            title: 'Professional Accountant', 
            email: 'hello@reallygreatsite.com', 
            phone: '123-456-7890', 
            location: 'Any City, ST 12345', 
            address: '123 Anywhere St., Any City', 
            website: 'www.reallygreatsite.com',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&q=80'
        },
        summary: 'Highly motivated and detail-oriented professional with strong experience. Known for strong analytical thinking, problem-solving abilities, and maintaining compliance with standards.',
        profile: 'I am a qualified and professional developer with five years of experience in database administration and website design. Strong creative and analytical skills. Team player with an eye for detail.',
        education: 'Bachelor of Technology\nReally Great University\n2014 - 2016\n\nSecondary School\nReally Great High School\n2010 - 2014',
        experience: 'Applications Developer\nReally Great Company\n2016 - Present\n- Database administration and website design\n- Built logic for streamlined ad platform\n\nWeb Content Manager\nReally Great Company\n2014 - 2016\n- Database administration and website design\n- Educational institutions management',
        skills: 'Web Design\nDesign Thinking\nWireframe Creation\nFront End Coding\nProblem-Solving',
        expertise: 'UI/UX\nVisual Design\nWireframes\nStoryboards\nUser Flows',
        languages: 'English (Fluent)\nSpanish (Basic)\nGerman (Basic)',
        references: 'Bailey Dupont\nWardiere Inc. / CEO\nPhone: 123-456-7890\nEmail: hello@reallygreatsite.com\n\nHarumi Kobayashi\nWardiere Inc. / CEO\nPhone: 123-456-7890\nEmail: hello@reallygreatsite.com',
        rewards: 'The Best Employee of the Year\nOct 2019 | Liceria & Co.\n\nThe Best Employee of the Year\nMay 2017 | Liceria & Co.',
        projects: 'E-Commerce Platform (Jan 2024)\n- Full stack MERN application with Stripe integration.\n\nTask Manager (Nov 2023)\n- React application with drag and drop features.'
    });
    const { toPDF, targetRef } = usePDF({
        filename: `${resumeData.personal.name || "Resume"}.pdf`,
    });
    
    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const response = await api.getProfile();
                const p = response.data;
                if (p) {
                    const eduStr = p.academic_records?.map(r => 
                        `${r.course}\n${r.institution}\n${r.start_year} - ${r.end_year}\nScore: ${r.score_type === 'percent' ? r.score + '%' : r.score + '/10'}`
                    ).join('\n\n') || '';

                    const projStr = p.projects?.map(pr => 
                        `${pr.title}\n${pr.description || ''}\nLink: ${pr.project_url || pr.github_url || ''}`
                    ).join('\n\n') || '';

                    const skillsStr = p.skills?.map(s => s.name).join('\n') || '';
                    const expertiseStr = p.skills?.slice(0, 5).map(s => s.name).join('\n') || '';

                    setResumeData(prev => ({
                        ...prev,
                        personal: {
                            name: p.full_name || prev.personal.name,
                            title: p.branch ? `${p.branch} Student` : prev.personal.title,
                            email: p.user?.email || prev.personal.email,
                            phone: p.user?.phone || prev.personal.phone || '123-456-7890',
                            location: p.address || prev.personal.location,
                            address: p.address || prev.personal.address,
                            website: p.linkedin_url || prev.personal.website,
                            photo: p.profile_photo || prev.personal.photo
                        },
                        summary: p.about_me || prev.summary,
                        profile: p.about_me || prev.profile,
                        education: eduStr || prev.education,
                        skills: skillsStr || prev.skills,
                        expertise: expertiseStr || prev.expertise,
                        projects: projStr || prev.projects
                    }));
                }
            } catch (e) {
                console.error("Failed to load student profile for resume builder", e);
            }
        };
        fetchStudentProfile();
    }, []);

    useEffect(() => {
        const schema = TEMPLATE_SCHEMAS[selectedTemplate];

        if (!schema.includes(activeSection)) {
            setActiveSection(schema[0]);
        }
    }, [selectedTemplate, activeSection]);   

    const handlePersonalChange = (field, value) => setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
    const handleBasicChange = (field, value) => setResumeData(prev => ({ ...prev, [field]: value }));

    const renderTemplateSelector = () => (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="w-full md:w-auto">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700">Choose Template</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {Object.keys(TEMPLATE_SCHEMAS).map(t => (
                            <button key={t} onClick={() => { setSelectedTemplate(t); setActiveSection('personal'); }} className={`px-4 py-2 text-sm rounded-lg border-2 transition whitespace-nowrap ${selectedTemplate === t ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                                {TEMPLATE_NAMES[t]}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-full md:w-auto">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700">Theme Color</h3>
                    <div className="flex gap-2 items-center">
                        {THEMES.map(c => (
                            <button key={c} onClick={() => setThemeColor(c)} className={`w-8 h-8 rounded-full border-2 transition ${themeColor === c ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFormSection = () => {
        const activeSchema = TEMPLATE_SCHEMAS[selectedTemplate];
        
        // if (!activeSchema.includes(activeSection) && activeSection !== 'personal') {
        //     setActiveSection(activeSchema[0]);
        // }

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-220px)] min-h-[600px]">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">Edit Details</h3>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {activeSchema.map(section => (
                            <button key={section} onClick={() => setActiveSection(section)} className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition ${activeSection === section ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-200'}`}>
                                {section.charAt(0).toUpperCase() + section.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50">
                    {activeSection === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 block mb-2">Profile Photo</label>
                                <ImageUpload value={resumeData.personal.photo} onChange={val => handlePersonalChange('photo', val)} />
                            </div>
                            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Full Name</label><input value={resumeData.personal.name} onChange={e => handlePersonalChange('name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" /></div>
                            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Professional Title</label><input value={resumeData.personal.title} onChange={e => handlePersonalChange('title', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" /></div>
                            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Email</label><input value={resumeData.personal.email} onChange={e => handlePersonalChange('email', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" /></div>
                            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Phone</label><input value={resumeData.personal.phone} onChange={e => handlePersonalChange('phone', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" /></div>
                            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Address</label><input value={resumeData.personal.address} onChange={e => handlePersonalChange('address', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" /></div>
                            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Location / City</label><input value={resumeData.personal.location} onChange={e => handlePersonalChange('location', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" /></div>
                            <div><label className="text-xs font-semibold text-gray-500 block mb-1">Website</label><input value={resumeData.personal.website} onChange={e => handlePersonalChange('website', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" /></div>
                        </div>
                    )}
                    
                    {['summary', 'profile', 'education', 'skills', 'expertise', 'languages', 'experience', 'references', 'rewards', 'projects'].map(section => (
                        activeSection === section && (
                            <div key={section} className="h-full flex flex-col">
                                <label className="text-xs font-semibold text-gray-500 block mb-2 capitalize">{section} (Multiline Text)</label>
                                <textarea 
                                    value={resumeData[section]} 
                                    onChange={e => handleBasicChange(section, e.target.value)} 
                                    className="w-full flex-1 min-h-[300px] border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 leading-relaxed resize-none bg-white font-mono" 
                                    placeholder={`Enter your ${section} here... Use new lines to separate items.`}
                                />
                                <p className="text-xs text-gray-400 mt-2"><i className="fa-solid fa-circle-info mr-1"></i> Use double line breaks to separate major blocks (like different jobs or degrees).</p>
                            </div>
                        )
                    ))}
                </div>
            </div>
        );
    };

    const renderLines = (text, className = "") => {
        if (!text) return null;
        const blocks = text.split('\n\n');
        return blocks.map((block, i) => (
            <div key={i} className={`mb-3 ${className}`}>
                {block.split('\n').map((line, j) => (
                    <div key={j} className={j === 0 && blocks.length > 1 ? "font-semibold text-gray-900" : "text-gray-600"}>
                        {line.startsWith('- ') ? <span className="ml-2">• {line.substring(2)}</span> : line}
                    </div>
                ))}
            </div>
        ));
    };
    
    const renderSimpleList = (text, bullet = false) => {
        if (!text) return null;
        return text.split('\n').filter(l=>l.trim()).map((line, i) => (
            <div key={i} className="mb-1">{bullet && <span className="mr-2">•</span>}{line}</div>
        ));
    };

    const renderPreviewSection = () => {
        const pd = resumeData.personal;

        return (
            
            <div ref={targetRef}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-y-auto w-full ">
                <div className="origin-top aspect-[1/1.414] w-full min-h-[1056px] relative text-sm bg-white overflow-hidden">
                    
                    {selectedTemplate === 'template1' && (
                        <div className="flex h-full w-full">
                            <div className="w-1/3 text-white p-8 flex flex-col gap-8" style={{ backgroundColor: '#3f3f46' }}>
                                {pd.photo && <img src={pd.photo} alt="Profile" className="w-40 h-40 rounded-full object-cover mx-auto border-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                                
                                <div>
                                    <h2 className="text-xl font-bold mb-4 border-b pb-2 uppercase tracking-widest text-gray-100" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>Contact</h2>
                                    <div className="space-y-4 text-xs text-gray-300">
                                        {pd.phone && <div><strong className="block text-gray-100 mb-0.5">Phone</strong>{pd.phone}</div>}
                                        {pd.email && <div><strong className="block text-gray-100 mb-0.5">Email</strong>{pd.email}</div>}
                                        {pd.address && <div><strong className="block text-gray-100 mb-0.5">Address</strong>{pd.address}</div>}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold mb-4 border-b pb-2 uppercase tracking-widest text-gray-100" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>Education</h2>
                                    <div className="text-xs text-gray-300">{renderLines(resumeData.education)}</div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold mb-4 border-b pb-2 uppercase tracking-widest text-gray-100" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>Expertise</h2>
                                    <div className="text-xs text-gray-300">{renderSimpleList(resumeData.expertise, true)}</div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold mb-4 border-b pb-2 uppercase tracking-widest text-gray-100" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>Reward</h2>
                                    <div className="text-xs text-gray-300">{renderLines(resumeData.rewards)}</div>
                                </div>
                            </div>
                            <div className="w-2/3 p-10 bg-white">
                                <div className="mb-10">
                                    <h1 className="text-6xl font-black text-gray-800 leading-none mb-2" style={{ color: themeColor }}>{pd.name.split(' ')[0]}<br/><span className="font-normal">{pd.name.split(' ').slice(1).join(' ')}</span></h1>
                                    <h2 className="text-2xl text-gray-600">{pd.title}</h2>
                                </div>

                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold mb-4 border-b-2 pb-2 text-gray-800" style={{ borderBottomColor: themeColor }}>Experience</h2>
                                    <div className="text-sm">{renderLines(resumeData.experience)}</div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold mb-4 border-b-2 pb-2 text-gray-800" style={{ borderBottomColor: themeColor }}>Reference</h2>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {resumeData.references.split('\n\n').map((ref, i) => {
                                            const lines = ref.split('\n');
                                            return (
                                                <div key={i}>
                                                    <div className="font-bold text-gray-900">{lines[0]}</div>
                                                    <div className="text-gray-600 mb-2">{lines[1]}</div>
                                                    <div className="text-xs">{lines[2]}</div>
                                                    <div className="text-xs">{lines[3]}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTemplate === 'template2' && (
                        <div className="flex flex-col h-full w-full bg-white font-sans">
                            <div className="p-10 pb-6 flex items-center justify-between border-b border-gray-200">
                                <div>
                                    <h1 className="text-5xl font-light tracking-widest text-gray-900 uppercase mb-2">{pd.name}</h1>
                                    <div className="text-white tracking-[0.2em] px-4 py-1.5 uppercase text-sm inline-block" style={{ backgroundColor: themeColor }}>{pd.title}</div>
                                </div>
                                {pd.photo && <img src={pd.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-gray-100" />}
                            </div>
                            
                            <div className="flex flex-1">
                                <div className="w-1/2 p-10 pr-6 space-y-8">
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 tracking-widest uppercase text-gray-800 border-b pb-2">Profile</h2>
                                        <p className="text-gray-600 leading-relaxed">{resumeData.profile}</p>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 tracking-widest uppercase text-gray-800 border-b pb-2">Experience</h2>
                                        <div>{renderLines(resumeData.experience)}</div>
                                    </div>
                                </div>
                                <div className="w-1/2 p-10 pl-6 border-l border-gray-200 flex flex-col justify-between">
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-xl font-bold mb-4 tracking-widest uppercase text-gray-800 border-b pb-2">Education</h2>
                                            <div>{renderLines(resumeData.education)}</div>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold mb-4 tracking-widest uppercase text-gray-800 border-b pb-2">Skills</h2>
                                            <div className="text-gray-600 space-y-1">{renderSimpleList(resumeData.skills, true)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 text-white flex justify-around text-sm" style={{ backgroundColor: themeColor }}>
                                {pd.phone && <div className="flex items-center gap-2"><i className="fa-solid fa-phone"></i> {pd.phone}</div>}
                                {pd.email && <div className="flex items-center gap-2"><i className="fa-solid fa-envelope"></i> {pd.email}</div>}
                                {pd.location && <div className="flex items-center gap-2"><i className="fa-solid fa-location-dot"></i> {pd.location}</div>}
                                {pd.website && <div className="flex items-center gap-2"><i className="fa-solid fa-globe"></i> {pd.website}</div>}
                            </div>
                        </div>
                    )}

                    {selectedTemplate === 'template3' && (
                        <div className="flex h-full w-full">
                            <div className="w-[35%] text-white p-8 flex flex-col" style={{ backgroundColor: themeColor }}>
                                {pd.photo && <img src={pd.photo} alt="Profile" className="w-48 h-48 rounded-full object-cover mx-auto mb-10 border-4 border-white/20 shadow-lg" />}
                                
                                <div className="mb-10">
                                    <h2 className="text-xl font-bold mb-4 border-b border-white/30 pb-2 uppercase tracking-widest">Contact</h2>
                                    <div className="space-y-4 text-sm text-white/90">
                                        {pd.phone && <div className="flex items-center gap-3"><i className="fa-solid fa-phone w-5"></i>{pd.phone}</div>}
                                        {pd.email && <div className="flex items-center gap-3"><i className="fa-solid fa-envelope w-5"></i>{pd.email}</div>}
                                        {pd.website && <div className="flex items-center gap-3"><i className="fa-solid fa-globe w-5"></i>{pd.website}</div>}
                                        {pd.location && <div className="flex items-center gap-3"><i className="fa-solid fa-location-dot w-5"></i>{pd.location}</div>}
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <h2 className="text-xl font-bold mb-4 border-b border-white/30 pb-2 uppercase tracking-widest">Skills</h2>
                                    <div className="space-y-3 text-sm text-white/90">
                                        {resumeData.skills.split('\n').filter(Boolean).map((skill, i) => (
                                            <div key={i}>
                                                <div className="mb-1">{skill}</div>
                                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold mb-4 border-b border-white/30 pb-2 uppercase tracking-widest">Languages</h2>
                                    <div className="space-y-3 text-sm text-white/90">
                                        {resumeData.languages.split('\n').filter(Boolean).map((lang, i) => (
                                            <div key={i}>
                                                <div className="mb-1">{lang.split('(')[0].trim()}</div>
                                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white rounded-full" style={{ width: lang.includes('Fluent') ? '90%' : '50%' }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-[65%] p-10 bg-[#f8f9fa] flex flex-col">
                                <div className="mb-8 pt-8">
                                    <h1 className="text-5xl font-bold text-gray-800 tracking-wider mb-2 uppercase" style={{ color: themeColor }}>{pd.name}</h1>
                                    <h2 className="text-xl text-gray-500 font-medium">{pd.title}</h2>
                                </div>

                                <div className="mb-8">
                                    <h2 className="text-xl font-bold mb-3 uppercase tracking-widest text-gray-800">Profile</h2>
                                    <p className="text-gray-600 leading-relaxed text-sm">{resumeData.profile}</p>
                                </div>

                                <div className="mb-8">
                                    <h2 className="text-xl font-bold mb-4 uppercase tracking-widest text-gray-800">Work Experience</h2>
                                    <div className="text-sm">{renderLines(resumeData.experience)}</div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold mb-4 uppercase tracking-widest text-gray-800">Education</h2>
                                    <div className="text-sm">{renderLines(resumeData.education)}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTemplate === 'template4' && (
                        <div className="flex flex-col h-full w-full bg-white p-12">
                            <div className="flex gap-8 mb-10 border-b pb-10 border-gray-200 items-center">
                                {pd.photo && <img src={pd.photo} alt="Profile" className="w-48 h-48 rounded-full object-cover shadow-sm" />}
                                <div className="flex-1">
                                    <h1 className="text-5xl font-light tracking-widest uppercase mb-2 text-gray-800">{pd.name}</h1>
                                    <h2 className="text-xl text-gray-500 mb-6 font-medium">{pd.title}</h2>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        {pd.phone && <span className="flex items-center gap-2"><i className="fa-solid fa-phone"></i> {pd.phone}</span>}
                                        {pd.email && <span className="flex items-center gap-2"><i className="fa-solid fa-at"></i> {pd.email}</span>}
                                        {pd.website && <span className="flex items-center gap-2"><i className="fa-solid fa-globe"></i> {pd.website}</span>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-10 flex-1">
                                <div className="w-1/3 space-y-8 border-r border-gray-200 pr-10">
                                    <div>
                                        <h2 className="text-lg font-bold mb-3 uppercase tracking-widest text-gray-900 border-t-2 pt-2" style={{ borderTopColor: themeColor }}>Summary</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed">{resumeData.summary}</p>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold mb-3 uppercase tracking-widest text-gray-900 border-t-2 pt-2" style={{ borderTopColor: themeColor }}>Education</h2>
                                        <div className="text-sm">{renderLines(resumeData.education)}</div>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold mb-3 uppercase tracking-widest text-gray-900 border-t-2 pt-2" style={{ borderTopColor: themeColor }}>Skills</h2>
                                        <div className="text-sm text-gray-600">{renderSimpleList(resumeData.skills, true)}</div>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold mb-3 uppercase tracking-widest text-gray-900 border-t-2 pt-2" style={{ borderTopColor: themeColor }}>Language</h2>
                                        <div className="text-sm text-gray-600">{renderSimpleList(resumeData.languages, true)}</div>
                                    </div>
                                </div>
                                <div className="w-2/3 space-y-8">
                                    <div>
                                        <h2 className="text-lg font-bold mb-4 uppercase tracking-widest text-gray-900 border-t-2 pt-2" style={{ borderTopColor: themeColor }}>Experience</h2>
                                        <div className="text-sm">{renderLines(resumeData.experience)}</div>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold mb-4 uppercase tracking-widest text-gray-900 border-t-2 pt-2" style={{ borderTopColor: themeColor }}>References</h2>
                                        <div className="text-sm grid grid-cols-2 gap-6">
                                            {resumeData.references.split('\n\n').map((ref, i) => {
                                                const lines = ref.split('\n');
                                                return (
                                                    <div key={i} className="text-gray-600">
                                                        <div className="font-bold text-gray-900">{lines[0]}</div>
                                                        <div className="mb-2">{lines[1]}</div>
                                                        <div><strong className="text-gray-900">Phone:</strong> {lines[2]?.replace('Phone:', '')}</div>
                                                        <div><strong className="text-gray-900">Email:</strong> {lines[3]?.replace('Email:', '')}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTemplate === 'template5' && (
                        <div className="flex flex-col h-full w-full bg-white font-sans">
                            <div className="relative bg-gray-200 h-48 w-full">
                                <div className="absolute top-12 left-12 flex gap-8">
                                    {pd.photo && <img src={pd.photo} alt="Profile" className="w-40 h-40 rounded-full object-cover shadow-xl border-4 border-white" />}
                                    <div className="mt-8">
                                        <h1 className="text-4xl font-bold tracking-wider text-gray-800 uppercase mb-2">{pd.name}</h1>
                                        <h2 className="text-xl text-gray-600 tracking-widest">{pd.title}</h2>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-1 mt-16 px-12 pb-12 gap-10">
                                <div className="w-1/3 space-y-8">
                                    <div className="space-y-4 text-sm text-gray-600">
                                        {pd.phone && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center"><i className="fa-solid fa-phone"></i></div>{pd.phone}</div>}
                                        {pd.email && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center"><i className="fa-solid fa-envelope"></i></div>{pd.email}</div>}
                                        {pd.website && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center"><i className="fa-solid fa-globe"></i></div>{pd.website}</div>}
                                        {pd.location && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center"><i className="fa-solid fa-house"></i></div>{pd.location}</div>}
                                    </div>
                                    
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 bg-gray-200 px-3 py-1 inline-block text-gray-800" style={{ borderLeft: `4px solid ${themeColor}` }}>Education</h2>
                                        <div className="text-sm">{renderLines(resumeData.education)}</div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold mb-4 bg-gray-200 px-3 py-1 inline-block text-gray-800" style={{ borderLeft: `4px solid ${themeColor}` }}>Expertise</h2>
                                        <div className="text-sm text-gray-600 space-y-2">{renderSimpleList(resumeData.expertise, false)}</div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold mb-4 bg-gray-200 px-3 py-1 inline-block text-gray-800" style={{ borderLeft: `4px solid ${themeColor}` }}>Language</h2>
                                        <div className="text-sm text-gray-600 space-y-2">{renderSimpleList(resumeData.languages, false)}</div>
                                    </div>
                                </div>
                                <div className="w-2/3 space-y-8 border-l border-gray-100 pl-8">
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><i className="fa-regular fa-user"></i> Profile</h2>
                                        <p className="text-gray-600 text-sm leading-relaxed">{resumeData.profile}</p>
                                    </div>
                                    
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><i className="fa-solid fa-briefcase"></i> Work Experience</h2>
                                        <div className="text-sm">{renderLines(resumeData.experience)}</div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><i className="fa-solid fa-book-open"></i> References</h2>
                                        <div className="grid grid-cols-2 gap-6 text-sm">
                                            {resumeData.references.split('\n\n').map((ref, i) => {
                                                const lines = ref.split('\n');
                                                return (
                                                    <div key={i} className="text-gray-600">
                                                        <div className="font-bold text-gray-900">{lines[0]}</div>
                                                        <div className="mb-2">{lines[1]}</div>
                                                        <div><strong className="text-gray-900">Phone:</strong> {lines[2]?.replace('Phone:', '')}</div>
                                                        <div><strong className="text-gray-900">Email:</strong> {lines[3]?.replace('Email:', '')}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTemplate === 'template6' && (
                        <div className="text-gray-800 text-sm font-sans p-12">
                            <div className="mb-6 border-b-2 pb-4" style={{ borderColor: themeColor }}>
                                <h1 className="text-4xl font-bold uppercase tracking-wider mb-1" style={{ color: themeColor }}>{pd.name}</h1>
                                <div className="text-xl text-gray-600 mb-2">{pd.title}</div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                    {pd.email && <span>{pd.email}</span>}
                                    {pd.phone && <span>{pd.phone}</span>}
                                    {pd.location && <span>{pd.location}</span>}
                                    {pd.linkedin && <span>{pd.linkedin}</span>}
                                </div>
                            </div>
                            {resumeData.summary && <div className="mb-6"><h2 className="text-lg font-bold mb-2 uppercase tracking-wide" style={{ color: themeColor }}>Summary</h2><p className="leading-relaxed">{resumeData.summary}</p></div>}
                            
                            <div className="grid grid-cols-3 gap-8">
                                <div className="col-span-1 space-y-6">
                                    <div><h2 className="text-lg font-bold mb-2 uppercase tracking-wide" style={{ color: themeColor }}>Skills</h2><div>{renderSimpleList(resumeData.skills, true)}</div></div>
                                    <div><h2 className="text-lg font-bold mb-2 uppercase tracking-wide" style={{ color: themeColor }}>Education</h2><div>{renderLines(resumeData.education)}</div></div>
                                </div>
                                <div className="col-span-2 space-y-6">
                                    <div><h2 className="text-lg font-bold mb-2 uppercase tracking-wide" style={{ color: themeColor }}>Experience</h2><div>{renderLines(resumeData.experience)}</div></div>
                                    <div><h2 className="text-lg font-bold mb-2 uppercase tracking-wide" style={{ color: themeColor }}>Projects</h2><div>{renderLines(resumeData.projects)}</div></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const downloadPDF = async () => {
        const element = resumeRef.current;
        if (!element) return;

        // const canvas = await html2canvas(element, {
        //     scale: 2,
        //     useCORS: true,
        //     backgroundColor: "#ffffff"
        // });

        const imgData = canvas.toDataURL("image/png");

        // const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight =
            (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        pdf.save(`${resumeData.personal.name || "Resume"}.pdf`);
    };    

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Resume Builder</h2>
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/ats', { state: { resumeData } })} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow-sm flex items-center gap-2">
                            <i className="fa-solid fa-magnifying-glass-chart"></i> ATS Check
                        </button>
                        <button
                            onClick={() => toPDF()}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <i className="fa-solid fa-download"></i> Download PDF
                        </button>
                    </div>
                </div>

                {renderTemplateSelector()}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-4 h-full">
                        {renderFormSection()}
                    </div>

                    <div className="block xl:col-span-8 h-full">
                        {renderPreviewSection()}
                    </div>
                </div>
            </div>
        </div>
    );
};
