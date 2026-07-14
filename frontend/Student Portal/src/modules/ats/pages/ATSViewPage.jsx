import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../../core/context/AppContext';
import { api } from '../../../core/services/api';

export const ATSViewPage = () => {
    const { data } = useApp();
    const location = useLocation();
    const passedResumeData = location.state?.resumeData;
    
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const fileInputRef = useRef(null);

    // Initial state based on context (mock data)
    const [ats, setAts] = useState(data?.atsScore || { overall: 0, content: 0, format: 0, keywords: 0, structure: 0 });
    const [analysis, setAnalysis] = useState(data?.atsAnalysis || []);
    const [matched, setMatched] = useState(data?.matchedKeywords || []);
    const [missing, setMissing] = useState(data?.missingKeywords || []);

    // Load latest ATS on mount if nothing passed
    useEffect(() => {
        if (!passedResumeData && !uploadedFile) {
            api.getLatestATS()
                .then(res => {
                    const latest = res.data;
                    setAts({
                        overall: latest.overall_score,
                        content: latest.content_score,
                        format: latest.format_score,
                        keywords: latest.keyword_score,
                        structure: latest.structure_score
                    });
                    setMatched(latest.matched_keywords || []);
                    setMissing(latest.missing_keywords || []);
                    
                    const sectionsFeedback = latest.section_feedback || {};
                    const formattedAnalysis = Object.keys(sectionsFeedback).map(key => ({
                        param: key,
                        status: sectionsFeedback[key].status,
                        note: sectionsFeedback[key].note
                    }));
                    setAnalysis(formattedAnalysis);
                })
                .catch(err => {
                    console.log("No previous ATS analysis found or error loading it", err);
                });
        }
    }, [passedResumeData, uploadedFile]);

    // If navigated from ResumeBuilder, recalculate score dynamically based on form fields
    useEffect(() => {
        if (passedResumeData && !uploadedFile) {
            calculateFromResumeData(passedResumeData);
        }
    }, [passedResumeData]);

    const calculateFromResumeData = (rd) => {
        let overall = 50;
        let content = 50;
        let format = 80; // Builder forces good format
        let keywords = 40;
        let structure = 70;
        
        let localMatched = ['Teamwork', 'Communication'];
        let localMissing = ['AWS', 'Docker', 'CI/CD', 'TypeScript', 'Agile'];

        if (rd.personal.name && rd.personal.email && rd.personal.phone) {
            content += 10;
            structure += 10;
        }
        
        if (rd.experience && rd.experience.length > 50) {
            content += 15;
            keywords += 10;
            localMatched.push('Database administration', 'Design');
        }
        
        if (rd.education && rd.education.length > 20) {
            content += 10;
        }
        
        if (rd.skills && rd.skills.length > 30) {
            keywords += 20;
            localMatched.push('Web Design', 'Problem-Solving');
        }

        overall = Math.round((content + format + keywords + structure) / 4);

        setAts({
            overall: Math.min(overall, 100),
            content: Math.min(content, 100),
            format: Math.min(format, 100),
            keywords: Math.min(keywords, 100),
            structure: Math.min(structure, 100)
        });

        setMatched(localMatched);
        setMissing(localMissing);

        setAnalysis([
            { param: 'Contact Information', status: (rd.personal.name && rd.personal.email) ? 'Excellent' : 'Needs Improvement' },
            { param: 'Work Experience Length', status: rd.experience.length > 50 ? 'Good' : 'Needs Improvement' },
            { param: 'Skills Section Presence', status: rd.skills.length > 0 ? 'Excellent' : 'Needs Improvement' },
            { param: 'Format & Structure', status: 'Excellent' } // Always excellent from builder
        ]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleFileSelect = (file) => {
        if (!file) return;
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
            alert('Please upload a PDF or DOCX file.');
            return;
        }
        setUploadedFile(file);
        
        setAnalyzing(true);
        const formData = new FormData();
        formData.append("resume_file", file);
        formData.append("job_description", "");

        api.analyzeResume(formData)
            .then(res => {
                const result = res.data;
                setAts({
                    overall: result.overall_score,
                    content: result.content_score,
                    format: result.format_score,
                    keywords: result.keyword_score,
                    structure: result.structure_score
                });
                setMatched(result.matched_keywords || []);
                setMissing(result.missing_keywords || []);
                
                const sectionsFeedback = result.section_feedback || {};
                const formattedAnalysis = Object.keys(sectionsFeedback).map(key => ({
                    param: key,
                    status: sectionsFeedback[key].status,
                    note: sectionsFeedback[key].note
                }));
                setAnalysis(formattedAnalysis);
            })
            .catch(err => {
                console.error("ATS analysis API failed", err);
                alert("ATS Analysis failed. Please try again.");
            })
            .finally(() => {
                setAnalyzing(false);
            });
    };

    const clearUpload = () => {
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (passedResumeData) {
            calculateFromResumeData(passedResumeData);
        } else {
            setAts(data?.atsScore || {
                overall: 0,
                content: 0,
                format: 0,
                keywords: 0,
                structure: 0,
            });
            setAnalysis(data.atsAnalysis);
            setMatched(data.matchedKeywords);
            setMissing(data.missingKeywords);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-xl card-shadow p-8 mb-6 border border-gray-100">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Resume ATS Checker</h2>
                    <p className="text-gray-500 mt-2">Upload your resume to check its compatibility with Applicant Tracking Systems.</p>
                </div>

                {!uploadedFile ? (
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors
                            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileInput} accept=".pdf,.docx" className="hidden" />
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 shadow-sm'}`}>
                            <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Click or drag & drop to upload</h3>
                        <p className="text-sm text-gray-500">Supported formats: PDF, DOCX (Max 5MB)</p>
                    </div>
                ) : (
                    <div className="border border-gray-200 bg-gray-50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <i className={`fa-solid ${uploadedFile.name.endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-word'} text-xl`}></i>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{uploadedFile.name}</h4>
                                <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button onClick={clearUpload} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-2">
                            <i className="fa-solid fa-trash-can"></i> Remove & Re-upload
                        </button>
                    </div>
                )}
            </div>

            {analyzing ? (
                <div className="bg-white rounded-xl card-shadow p-12 text-center">
                    <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Resume...</h3>
                    <p className="text-gray-500">Running ATS algorithms and extracting keywords.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Hero Section */}
                    <div className="bg-white rounded-xl card-shadow p-6 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative w-36 h-36 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="72" cy="72" r="64" stroke="#E5E7EB" strokeWidth="12" fill="none"/>
                                <circle cx="72" cy="72" r="64" stroke={ats.overall >= 80 ? '#10B981' : ats.overall >= 60 ? '#F59E0B' : '#EF4444'} strokeWidth="12" fill="none"
                                    strokeDasharray={2 * Math.PI * 64 * (ats.overall / 100)}
                                    strokeDashoffset={2 * Math.PI * 64 * (1 - ats.overall / 100)}
                                    strokeLinecap="round"/>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-gray-900">{ats.overall}</span>
                                <span className="text-xs text-gray-500 font-medium mt-1">/ 100</span>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {ats.overall >= 80 ? 'Great job! Your resume is highly ATS-friendly.' : 
                                 ats.overall >= 60 ? 'Good start, but room for improvement.' : 
                                 'Your resume needs significant ATS optimization.'}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {uploadedFile ? 'Your uploaded file has been analyzed against standard ATS parsing rules.' : 
                                 passedResumeData ? 'Analysis based on the resume data sent from the Builder.' : 
                                 'This is a sample analysis. Upload your resume to see your real score.'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Score Breakdown */}
                        <div className="bg-white rounded-xl card-shadow p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Detailed Score</h3>
                            <div className="space-y-5">
                                <div><div className="flex justify-between text-sm mb-1.5"><span className="text-gray-700 font-medium">Content Quality</span><span className="font-bold text-gray-900">{ats.content}/100</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${ats.content}%` }}></div></div></div>
                                <div><div className="flex justify-between text-sm mb-1.5"><span className="text-gray-700 font-medium">Formatting</span><span className="font-bold text-gray-900">{ats.format}/100</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${ats.format}%` }}></div></div></div>
                                <div><div className="flex justify-between text-sm mb-1.5"><span className="text-gray-700 font-medium">Keywords Match</span><span className="font-bold text-gray-900">{ats.keywords}/100</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${ats.keywords}%` }}></div></div></div>
                                <div><div className="flex justify-between text-sm mb-1.5"><span className="text-gray-700 font-medium">Structure</span><span className="font-bold text-gray-900">{ats.structure}/100</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${ats.structure}%` }}></div></div></div>
                            </div>
                        </div>

                        {/* Analysis Table */}
                        <div className="lg:col-span-2 bg-white rounded-xl card-shadow p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis Breakdown</h3>
                            <div className="space-y-3">
                                {analysis.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                                        <span className="text-sm font-medium text-gray-700">{item.param}</span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                            item.status === 'Excellent' ? 'bg-green-100 text-green-700 border border-green-200' :
                                            item.status === 'Good' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                            'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                        }`}>{item.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Keywords */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl card-shadow p-6 border-t-4 border-green-500">
                            <div className="flex items-center gap-2 mb-4">
                                <i className="fa-solid fa-check-circle text-green-500 text-xl"></i>
                                <h3 className="text-lg font-bold text-gray-900">Found Keywords</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {matched.map((kw, i) => (
                                    <span key={i} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 text-sm rounded-lg font-medium">{kw}</span>
                                ))}
                                {matched.length === 0 && <p className="text-sm text-gray-500">No key skills identified.</p>}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl card-shadow p-6 border-t-4 border-red-500">
                            <div className="flex items-center gap-2 mb-4">
                                <i className="fa-solid fa-triangle-exclamation text-red-500 text-xl"></i>
                                <h3 className="text-lg font-bold text-gray-900">Missing Keywords</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {missing.map((kw, i) => (
                                    <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 text-sm rounded-lg font-medium">{kw}</span>
                                ))}
                                {missing.length === 0 && <p className="text-sm text-gray-500">You matched all expected keywords!</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
