import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Settings() {
  // Admin Info States
  const [adminName, setAdminName] = useState("Administrator");
  const [adminEmail, setAdminEmail] = useState("admin@university.edu");
  const [adminPhone, setAdminPhone] = useState("+91 98765 43210");
  
  // Change Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSuccessMsg, setPwSuccessMsg] = useState("");
  const [pwErrorMsg, setPwErrorMsg] = useState("");

  // Portal Preferences
  const [autoApprove, setAutoApprove] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [minCgpaDefault, setMinCgpaDefault] = useState("6.0");
  
  // Notification Toast state
  const [saveToast, setSaveToast] = useState("");

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaveToast("Profile details updated successfully!");
    setTimeout(() => setSaveToast(""), 4000);
  };

  const handleSavePrefs = (e) => {
    e.preventDefault();
    setSaveToast("Portal preferences saved successfully!");
    setTimeout(() => setSaveToast(""), 4000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwErrorMsg("New passwords do not match!");
      setPwSuccessMsg("");
      return;
    }
    
    setPwErrorMsg("");
    setPwSuccessMsg("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPwSuccessMsg(""), 5000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7f6] font-sans font-normal text-gray-900">
      <Sidebar />

      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar />

        <div className="flex-1 overflow-y-auto p-6 max-w-screen-2xl mx-auto w-full flex flex-col gap-6">
          
          {/* Header */}
          <div className="flex justify-between items-center shrink-0">
            <div>
              <h1 className="text-2xl font-normal text-gray-900">Settings & Configuration</h1>
              <p className="text-sm font-normal text-gray-500 mt-1">Configure placement portal preferences and manage your account.</p>
            </div>
          </div>

          {/* Toast Notification */}
          {saveToast && (
            <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50 text-sm font-medium">
              <i className="fa-solid fa-circle-check text-green-400"></i> {saveToast}
            </div>
          )}

          {/* Settings Options Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8 items-start">
            
            {/* Left Column: Account Details & Preferences */}
            <div className="space-y-6">
              
              {/* Account Profile Form */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-5 flex items-center gap-2">
                  <i className="fa-regular fa-user text-blue-500"></i> Account Details
                </h3>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={adminName} 
                        onChange={(e) => setAdminName(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Contact Phone</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={adminPhone} 
                        onChange={(e) => setAdminPhone(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={adminEmail} 
                      onChange={(e) => setAdminEmail(e.target.value)} 
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Portal System Settings */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-5 flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-green-500"></i> Portal Preferences
                </h3>
                <form onSubmit={handleSavePrefs} className="space-y-5">
                  
                  {/* Default Cutoff */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Default Eligibility Cutoff (CGPA)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      className="w-full sm:w-1/3 p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={minCgpaDefault}
                      onChange={(e) => setMinCgpaDefault(e.target.value)}
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Default minimum score suggestion when adding new job openings.</p>
                  </div>

                  {/* Toggle 1: Auto-Approve */}
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Auto-Verify Student Profiles</span>
                      <span className="text-xs text-gray-500">Skip Placement Officer verification queues for new signups.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={autoApprove}
                        onChange={(e) => setAutoApprove(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Toggle 2: Email Updates */}
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Email Alerts & Notifications</span>
                      <span className="text-xs text-gray-500">Send direct mail notifications on job applications.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Toggle 3: Registrations Open */}
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Allow Student Registrations</span>
                      <span className="text-xs text-gray-500">Open or freeze registrations for student portal logins.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={allowRegistration}
                        onChange={(e) => setAllowRegistration(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-50">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm">
                      Save Preferences
                    </button>
                  </div>

                </form>
              </div>

            </div>

            {/* Right Column: Password Changes */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-5 flex items-center gap-2">
                <i className="fa-solid fa-lock text-red-500"></i> Change Password
              </h3>

              {pwSuccessMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs font-medium mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-green-500"></i> {pwSuccessMsg}
                </div>
              )}

              {pwErrorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-medium mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-circle-xmark text-red-500"></i> {pwErrorMsg}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Current Password</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="Enter current password"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">New Password</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="Enter new password"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="Confirm new password"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors shadow-sm">
                    Update Password
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}