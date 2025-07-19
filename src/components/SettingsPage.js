import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-regular-svg-icons';

const NOTIF_PREFS_KEY = 'notifPrefs';
const defaultPrefs = { like: true, comment: true, follow: true };

const SettingsPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem(NOTIF_PREFS_KEY);
    return saved ? JSON.parse(saved) : defaultPrefs;
  });
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('authToken');
  const bellRef = useRef();

  useEffect(() => {
    if (!userId || !token) return;
    fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/followers`)
      .then(res => res.json())
      .then(setFollowers);
    fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/following`)
      .then(res => res.json())
      .then(setFollowing);
    fetch(`${process.env.REACT_APP_API_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      });
  }, [userId, token]);

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  const handleNotifToggle = (type) => {
    const updated = { ...notifPrefs, [type]: !notifPrefs[type] };
    setNotifPrefs(updated);
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(updated));
  };

  const handleBellClick = () => {
    setShowDropdown(d => !d);
    // Mark all as read when opening dropdown
    if (unreadCount > 0) {
      notifications.filter(n => !n.read).forEach(n => {
        fetch(`${process.env.REACT_APP_API_URL}/api/notifications/${n._id}/read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="settings-page" style={{ maxWidth: 400, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center" }}>
      {/* Notification bell icon with unread count and dropdown */}
      <div style={{ position: 'relative', marginBottom: 24 }} ref={bellRef}>
        <FontAwesomeIcon icon={faBell} style={{ fontSize: 28, color: '#888', cursor: 'pointer' }} onClick={handleBellClick} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, background: '#e74c3c', color: '#fff', borderRadius: '50%', fontSize: 12, padding: '2px 6px', fontWeight: 700 }}>{unreadCount}</span>
        )}
        {showDropdown && (
          <div style={{ position: 'absolute', top: 36, right: 0, width: 320, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', zIndex: 10, textAlign: 'left', maxHeight: 320, overflowY: 'auto' }}>
            <h4 style={{ margin: '12px 16px 8px 16px', fontSize: 16 }}>Notifications</h4>
            {notifications.length === 0 && <div style={{ padding: 16, color: '#888' }}>No notifications</div>}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {notifications.map(n => (
                <li key={n._id} style={{ padding: '8px 16px', background: n.read ? '#fff' : '#f0f8ff', borderBottom: '1px solid #f5f5f5', fontWeight: n.read ? 400 : 600 }}>
                  {n.type === 'like' && <span>❤️ <b>{n.fromUser?.username}</b> liked your photo</span>}
                  {n.type === 'comment' && <span>💬 <b>{n.fromUser?.username}</b> commented: "{n.commentId?.text}"</span>}
                  {n.type === 'follow' && <span>➕ <b>{n.fromUser?.username}</b> followed you</span>}
                  <span style={{ float: 'right', color: '#aaa', fontSize: 12 }}>{new Date(n.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <h2 style={{ marginBottom: 32 }}>Settings</h2>
      <button className="btn btn-danger" style={{ width: "100%", padding: 12, fontSize: 16, marginBottom: 32 }} onClick={handleLogoutClick}>
        Log Out
      </button>
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-outline" style={{ marginRight: 8 }} onClick={() => setShowFollowers(f => !f)}>
          Followers ({followers.length})
        </button>
        <button className="btn btn-outline" onClick={() => setShowFollowing(f => !f)}>
          Following ({following.length})
        </button>
      </div>
      {showFollowers && (
        <div style={{ marginBottom: 24, textAlign: 'left' }}>
          <h4>Followers</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {followers.map(f => (
              <li key={f._id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <img src={f.profilePic || '/default-avatar.png'} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                <span>{f.username}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {showFollowing && (
        <div style={{ marginBottom: 24, textAlign: 'left' }}>
          <h4>Following</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {following.map(f => (
              <li key={f._id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <img src={f.profilePic || '/default-avatar.png'} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                <span>{f.username}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ marginTop: 32, textAlign: 'left' }}>
        <h4>Notification Settings</h4>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <input type="checkbox" checked={notifPrefs.like} onChange={() => handleNotifToggle('like')} /> Likes
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <input type="checkbox" checked={notifPrefs.comment} onChange={() => handleNotifToggle('comment')} /> Comments
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <input type="checkbox" checked={notifPrefs.follow} onChange={() => handleNotifToggle('follow')} /> Follows
        </label>
      </div>
    </div>
  );
};

export default SettingsPage; 