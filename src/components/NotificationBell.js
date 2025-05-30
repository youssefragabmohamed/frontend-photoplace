import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { faBell as faBellSolid } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import notificationService from '../services/notificationService';
import '../App.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    notificationService.connect();
    fetchNotifications();

    notificationService.addListener('notification', handleNewNotification);

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      notificationService.removeListener('notification', handleNewNotification);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const fetchNotifications = async (loadMore = false) => {
    try {
      setLoading(true);
      const pageToFetch = loadMore ? page + 1 : 1;
      const { notifications: newNotifications, hasMore: more, unreadCount: count } = 
        await notificationService.getNotifications(pageToFetch);

      setNotifications(prev => 
        loadMore ? [...prev, ...newNotifications] : newNotifications
      );
      setHasMore(more);
      setUnreadCount(count);
      setPage(pageToFetch);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead([notificationId]);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId)
      );
      setUnreadCount(prev => 
        prev - (notifications.find(n => n._id === notificationId)?.read ? 0 : 1)
      );
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval > 1) {
        return `${interval} ${unit}s ago`;
      }
      if (interval === 1) {
        return `1 ${unit} ago`;
      }
    }
    return 'just now';
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <motion.div
        className="notification-bell"
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <FontAwesomeIcon icon={unreadCount > 0 ? faBellSolid : faBell} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  className="mark-all-read"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  No notifications yet
                </div>
              ) : (
                notifications.map(notification => (
                  <motion.div
                    key={notification._id}
                    className={`notification-item ${notification.read ? '' : 'unread'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div 
                      className="notification-content"
                      onClick={() => {
                        if (!notification.read) {
                          handleMarkAsRead(notification._id);
                        }
                      }}
                    >
                      <img
                        src={`${process.env.REACT_APP_API_URL}${notification.fromUser.profilePic}`}
                        alt={notification.fromUser.username}
                        className="notification-avatar"
                      />
                      <div className="notification-details">
                        <p className="notification-message">
                          {notification.message}
                        </p>
                        <span className="notification-time">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      className="delete-notification"
                      onClick={() => handleDelete(notification._id)}
                    >
                      ×
                    </button>
                  </motion.div>
                ))
              )}

              {loading && (
                <div className="notification-loading">
                  Loading...
                </div>
              )}

              {!loading && hasMore && (
                <button
                  className="load-more-notifications"
                  onClick={() => fetchNotifications(true)}
                >
                  Load more
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell; 