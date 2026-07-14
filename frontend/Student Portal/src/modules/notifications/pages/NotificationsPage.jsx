import React, { useEffect, useState } from 'react';
import { useApp } from '../../../core/context/AppContext';
import { api } from '../../../core/services/api';
import { Link } from 'react-router-dom';

export const NotificationsPage = () => {
    const { data, setData } = useApp();
    const [loading, setLoading] = useState(false);

    const notifications = data?.notifications || [];

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.getNotifications();
            const list = res.data.results || res.data || [];
            // Map created_at to readable relative time
            const formatTime = (dateString) => {
                try {
                    const date = new Date(dateString);
                    const now = new Date();
                    const diffMs = now - date;
                    const diffMins = Math.floor(diffMs / 60000);
                    if (diffMins < 1) return "Just now";
                    if (diffMins < 60) return `${diffMins}m ago`;
                    const diffHours = Math.floor(diffMins / 60);
                    if (diffHours < 24) return `${diffHours}h ago`;
                    const diffDays = Math.floor(diffHours / 24);
                    return `${diffDays}d ago`;
                } catch (e) {
                    return dateString;
                }
            };

            const formatted = list.map(n => ({
                ...n,
                read: n.is_read,
                time: formatTime(n.created_at)
            }));

            setData({ notifications: formatted });
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await api.markNotificationRead(id);
            setData({
                notifications: notifications.map(n =>
                    n.id === id ? { ...n, read: true, is_read: true } : n
                )
            });
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setData({
                notifications: notifications.map(n => ({ ...n, read: true, is_read: true }))
            });
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    const getIconClass = (type) => {
        switch (type) {
            case 'application_update':
                return {
                    bg: 'bg-purple-50 text-purple-600 border border-purple-100',
                    icon: 'fa-clipboard-check'
                };
            case 'new_job':
                return {
                    bg: 'bg-green-50 text-green-600 border border-green-100',
                    icon: 'fa-briefcase'
                };
            case 'interview_scheduled':
                return {
                    bg: 'bg-orange-50 text-orange-600 border border-orange-100',
                    icon: 'fa-calendar-check'
                };
            case 'drive_announcement':
                return {
                    bg: 'bg-blue-50 text-blue-600 border border-blue-100',
                    icon: 'fa-bullhorn'
                };
            default:
                return {
                    bg: 'bg-gray-50 text-gray-600 border border-gray-100',
                    icon: 'fa-bell'
                };
        }
    };

    const unreadNotifications = notifications.filter(n => !n.read);

    return (
        <div className="p-6 max-w-4xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Stay updated with placement drives and recruitment activities.</p>
                </div>
                {unreadNotifications.length > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 text-sm mt-3">Loading notifications...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                        <i className="fa-regular fa-bell text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No New Notifications</h3>
                    <p className="text-gray-500 mt-1">You're all caught up! Check back later for updates.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
                    {notifications.map((notif) => {
                        const style = getIconClass(notif.notif_type);
                        return (
                            <div
                                key={notif.id}
                                className={`p-4 flex items-start gap-4 transition-colors ${
                                    !notif.read ? 'bg-blue-50/20' : 'hover:bg-gray-50/50'
                                }`}
                            >
                                {/* Left Icon */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                                    <i className={`fa-solid ${style.icon} text-lg`}></i>
                                </div>

                                {/* Content Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className={`text-sm font-medium ${!notif.read ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                                            {notif.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                                    
                                    {/* Action Links */}
                                    {notif.link && (
                                        <div className="mt-2.5">
                                            <Link
                                                to={notif.link}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
                                            >
                                                View details <i className="fa-solid fa-chevron-right text-[10px]"></i>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side Actions */}
                                {!notif.read && (
                                    <button
                                        onClick={() => handleMarkAsRead(notif.id)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors self-center shrink-0 ml-2"
                                        title="Mark as read"
                                    >
                                        Mark Read
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

