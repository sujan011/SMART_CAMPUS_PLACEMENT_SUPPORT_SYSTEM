import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { api } from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Broadcast announcement form states
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceMessage, setAnnounceMessage] = useState("");
  const [targetBranch, setTargetBranch] = useState("All");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadNotifications = () => {
    setLoading(true);
    api.getNotifications()
      .then(res => {
        setNotifications(res.data.results || res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load notifications", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!announceTitle || !announceMessage) return;

    setSending(true);
    // Simulating sending a broadcast announcement notification to students in targetBranch
    setTimeout(() => {
      setSending(false);
      setSuccessMsg(`Announcement "${announceTitle}" broadcasted successfully to ${targetBranch} branch students!`);
      setAnnounceTitle("");
      setAnnounceMessage("");
      
      // Add it as a local confirmation alert in the admin's inbox
      setNotifications(prev => [
        {
          id: Date.now(),
          title: `Broadcast Sent: ${announceTitle}`,
          message: `Your message was broadcasted to ${targetBranch} branch.`,
          notif_type: "system",
          is_read: false,
          created_at: new Date().toISOString()
        },
        ...prev
      ]);

      setTimeout(() => setSuccessMsg(""), 5000);
    }, 1200);
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
              <h1 className="text-2xl font-normal text-gray-900">Notifications & Announcements</h1>
              <p className="text-sm font-normal text-gray-500 mt-1">Manage system alerts and broadcast placement announcements.</p>
            </div>
            {notifications.some(n => !n.is_read) && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-8">
            
            {/* Left/Middle Column: Notifications Inbox */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fa-regular fa-bell text-blue-500"></i> System Notifications
                </h3>

                {loading ? (
                  <div className="text-center py-12 text-gray-500">Loading alerts...</div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-regular fa-bell-slash text-2xl"></i>
                    </div>
                    <p className="text-gray-900 font-medium">All caught up!</p>
                    <p className="text-gray-500 text-sm mt-1">You have no new alerts or notifications at the moment.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`py-4 first:pt-0 last:pb-0 flex items-start gap-4 transition-colors ${!notif.is_read ? 'bg-blue-50/30 -mx-4 px-4 rounded-lg' : ''}`}
                      >
                        {/* Type Icon */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          notif.notif_type === 'application_update' ? 'bg-purple-50 text-purple-600' :
                          notif.notif_type === 'new_job' ? 'bg-green-50 text-green-600' :
                          notif.notif_type === 'interview_scheduled' ? 'bg-orange-50 text-orange-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          <i className={`fa-solid ${
                            notif.notif_type === 'application_update' ? 'fa-file-pen' :
                            notif.notif_type === 'new_job' ? 'fa-briefcase' :
                            notif.notif_type === 'interview_scheduled' ? 'fa-calendar-check' :
                            'fa-circle-info'
                          }`}></i>
                        </div>

                        {/* Text details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-sm font-medium ${!notif.is_read ? 'text-gray-900 font-semibold' : 'text-gray-800'}`}>{notif.title}</h4>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(notif.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                        </div>

                        {/* Read Toggle Button */}
                        {!notif.is_read && (
                          <button 
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap shrink-0 ml-2"
                            title="Mark read"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Broadcast Announcement */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-bullhorn text-green-500"></i> Broadcast Announcement
              </h3>
              
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Send a notification to all registered student portals regarding new drives, schedule changes, or guidelines.
              </p>

              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs font-medium mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-circle-check"></i> {successMsg}
                </div>
              )}

              <form onSubmit={handleBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Announcement Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. TCS Recruitment Drive 2026"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={announceTitle}
                    onChange={(e) => setAnnounceTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Target Branch/Department</label>
                  <select 
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                  >
                    <option value="All">All Branches</option>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="EE">Electrical (EE)</option>
                    <option value="ME">Mechanical (ME)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Message Content</label>
                  <textarea 
                    required
                    placeholder="Type details regarding date, time, venue, or eligibility requirements..."
                    rows={4}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    value={announceMessage}
                    onChange={(e) => setAnnounceMessage(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={sending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>Broadcasting...</>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Send Announcement
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}