// Components/NotificationModal.js
import React, { useState, useEffect } from "react";
import { Bell, X, Check, Trash2, Clock, AlertCircle, MessageCircle, IndianRupee, Star, FileText } from "lucide-react";
import NotificationApi from "../NotificationApi/NotificationApi";

const NotificationModal = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await NotificationApi.getNotifications();
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setError("Failed to load notifications. Please try again.");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
      setError("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setError(null);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      setError("Failed to mark all notifications as read");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await NotificationApi.deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setError("Failed to delete notification");
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Unknown time";
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'review':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'fee':
        return <IndianRupee className="w-4 h-4 text-green-500" />; // Changed to Rupees
      case 'review_score':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get badge color based on notification type
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'review':
        return "bg-blue-100 text-blue-800";
      case 'fee':
        return "bg-green-100 text-green-800";
      case 'review_score':
        return "bg-yellow-100 text-yellow-800";
      case 'message':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if notification is about week back fees (red color)
  const isWeekBackFee = (notification) => {
    return notification.type === 'fee' && 
           notification.message?.toLowerCase().includes('week back');
  };

  // Get notification background color
  const getNotificationBgColor = (notification) => {
    if (isWeekBackFee(notification)) {
      return "bg-red-50 border-l-red-500"; // Red background for week back fees
    }
    return !notification.isRead 
      ? "bg-white border-l-blue-500 shadow-sm" 
      : "bg-white border-l-gray-300";
  };

  // Get notification text color
  const getNotificationTextColor = (notification) => {
    if (isWeekBackFee(notification)) {
      return "text-red-900"; // Red text for week back fees
    }
    return !notification.isRead ? "text-gray-900" : "text-gray-600";
  };

  // Get message text color
  const getMessageTextColor = (notification) => {
    if (isWeekBackFee(notification)) {
      return "text-red-700 font-medium"; // Red message for week back fees
    }
    return "text-gray-600";
  };

  const filteredNotifications = notifications.filter(notif => 
    activeTab === "all" ? true : !notif.isRead
  );

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <div className="fixed inset-0 flex justify-end z-50">
      {/* Blurry White Background */}
      <div 
        className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Notification Panel with Slide Down Animation */}
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl transform animate-slide-down">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="w-7 h-7 text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
              <p className="text-sm text-gray-600">{notifications.length} total</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white transition-all duration-200 transform hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === "all"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`flex-1 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === "unread"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-4 border-b border-gray-200 bg-orange-50">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 text-sm text-orange-600 hover:text-orange-700 font-medium transition-all duration-200 hover:scale-105"
            >
              <Check className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="h-[calc(100vh-180px)] overflow-y-auto bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 text-sm">Loading notifications...</p>
            </div>
          ) : error && filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 space-y-3">
              <AlertCircle className="w-12 h-12 opacity-50" />
              <p className="text-center">Failed to load notifications</p>
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 space-y-3">
              <Bell className="w-12 h-12 opacity-50" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg transition-all duration-200 hover:shadow-md border-l-4 ${getNotificationBgColor(notification)}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold text-sm ${getNotificationTextColor(notification)}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200 hover:bg-green-50 rounded"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-3 leading-relaxed ${getMessageTextColor(notification)}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeBadgeColor(notification.type)}`}>
                          {notification.type?.replace('_', ' ') || 'system'}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>At {formatTime(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="flex items-center mt-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        isWeekBackFee(notification) ? "bg-red-500" : "bg-blue-500"
                      }`}></div>
                      <span className={`text-xs ml-2 font-medium ${
                        isWeekBackFee(notification) ? "text-red-600" : "text-blue-600"
                      }`}>
                        NEW
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-slide-down {
          animation: slide-down 0.4s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationModal;