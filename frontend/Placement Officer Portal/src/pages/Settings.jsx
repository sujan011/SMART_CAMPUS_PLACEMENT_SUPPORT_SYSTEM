import React, { useState, useEffect } from 'react';
import { Bell, Lock, Globe, Moon, Shield, Palette, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [savedStatus, setSavedStatus] = useState(false);

  // General States
  const [academicYear, setAcademicYear] = useState(localStorage.getItem('academicYear') || '2025-2026');
  const [language, setLanguage] = useState(localStorage.getItem('preferredLanguage') || 'English (US)');
  const [autoVerify, setAutoVerify] = useState(localStorage.getItem('autoVerify') === 'true');
  const [gpaCutoff, setGpaCutoff] = useState(localStorage.getItem('gpaCutoff') || '6.0');

  // Notifications States
  const [emailAlerts, setEmailAlerts] = useState(localStorage.getItem('emailAlerts') !== 'false');
  const [appAlerts, setAppAlerts] = useState(localStorage.getItem('appAlerts') !== 'false');
  const [pushAlerts, setPushAlerts] = useState(localStorage.getItem('pushAlerts') === 'true');

  // Password States
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Appearance States
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || 'blue');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  const tabs = [
    { id: 'general', label: 'General Settings', icon: <Globe size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security & Access', icon: <Lock size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
  ];

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    localStorage.setItem('academicYear', academicYear);
    localStorage.setItem('preferredLanguage', language);
    localStorage.setItem('autoVerify', autoVerify);
    localStorage.setItem('gpaCutoff', gpaCutoff);

    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    localStorage.setItem('emailAlerts', emailAlerts);
    localStorage.setItem('appAlerts', appAlerts);
    localStorage.setItem('pushAlerts', pushAlerts);

    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleSaveAppearance = (e) => {
    e.preventDefault();
    localStorage.setItem('accentColor', accentColor);
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
    
    document.documentElement.classList.remove('theme-blue', 'theme-indigo', 'theme-purple', 'theme-emerald');
    document.documentElement.classList.add(`theme-${accentColor}`);

    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    alert("Password updated successfully!");
    setCurrPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 pb-10 font-sans">
      
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <h2 className="text-xl font-bold text-slate-800 mb-6">System Settings</h2>
        <div className="space-y-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 relative">
        
        {/* Toast Save Alert */}
        {savedStatus && (
          <div className="absolute top-4 right-8 bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <Check size={14} /> Settings Saved successfully!
          </div>
        )}

        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Portal Preference Settings</h3>
              <p className="text-xs text-slate-400 mb-6">Manage global active terms and TPO filters.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Academic Year</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Active placement season year.</p>
                  </div>
                  <select 
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="border border-slate-200 rounded-lg px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-700"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Language</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Select preferred localized language.</p>
                  </div>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border border-slate-200 rounded-lg px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-700"
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="English (UK)">English (UK)</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Minimum CGPA Cutoff</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Define default eligibility cutoff CGPA threshold.</p>
                  </div>
                  <input 
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={gpaCutoff}
                    onChange={(e) => setGpaCutoff(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-slate-700 text-center w-20"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Auto-verify Student Registrations</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Instantly clear new student registrations.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={autoVerify}
                      onChange={() => setAutoVerify(!autoVerify)}
                    />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20">
              <Save size={14} /> Save Portal Settings
            </button>
          </form>
        )}

        {activeTab === 'notifications' && (
          <form onSubmit={handleSaveNotifications} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Notification Preferences</h3>
              <p className="text-xs text-slate-400 mb-6">Choose how and when you receive portal status digests.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Email Alerts</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Receive daily summary digests.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">New Application Alerts</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Instant alerts when students apply to roles.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={appAlerts} onChange={() => setAppAlerts(!appAlerts)} />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Push Broadcast Confirmations</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Browser popup updates on scheduled drives.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={pushAlerts} onChange={() => setPushAlerts(!pushAlerts)} />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20">
              <Save size={14} /> Save Notification Alerts
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Security & Access</h3>
              <p className="text-xs text-slate-400 mb-6">Update your account credentials safely.</p>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Current Password</label>
                  <input 
                    type="password"
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">New Password</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Confirm New Password</label>
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20">
              <Save size={14} /> Update Password
            </button>
          </form>
        )}

        {activeTab === 'appearance' && (
          <form onSubmit={handleSaveAppearance} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Visual Appearance Settings</h3>
              <p className="text-xs text-slate-400 mb-6">Customize the interface accent color and brightness.</p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-3">Accent Theme Color</h4>
                  <div className="flex gap-4">
                    {['blue', 'indigo', 'purple', 'emerald'].map((color) => (
                      <button 
                        key={color}
                        type="button"
                        onClick={() => setAccentColor(color)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all uppercase tracking-wider ${
                          accentColor === color 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Dark Theme Mode</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Toggle interface contrast styling.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20">
              <Save size={14} /> Save Style Changes
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
