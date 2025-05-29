import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUserEdit, faLink } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Photobox from "./Photobox";
import '../App.css'; // New CSS file

// Loading animation as data URL
const LOADING_ANIMATION = `data:image/svg+xml;base64,${btoa(`
<svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="#888">
    <g fill="none" fill-rule="evenodd" stroke-width="2">
        <circle cx="22" cy="22" r="1">
            <animate attributeName="r" begin="0s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
            <animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
        </circle>
        <circle cx="22" cy="22" r="1">
            <animate attributeName="r" begin="-0.9s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
            <animate attributeName="stroke-opacity" begin="-0.9s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
        </circle>
    </g>
</svg>`)}`;

const ProfilePage = ({ user }) => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState({});
  const [photos, setPhotos] = useState([]);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [notif, setNotif] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return LOADING_ANIMATION;
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_URL}${url}`;
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      try {
        // Fetch user profile
        const userRes = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!userRes.ok) {
          const error = await userRes.json();
          throw new Error(error.message || 'Failed to fetch profile');
        }

        const userData = await userRes.json();
        if (!userData.user) {
          throw new Error('Invalid profile data received');
        }

        setProfileUser(userData.user);
        setPhotos(userData.photos || []);

        // Fetch saved photos if it's the current user
        if (user && user._id === userId) {
          const savedRes = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/saved`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          if (!savedRes.ok) {
            if (savedRes.status === 404) {
              setSavedPhotos([]);
            } else {
              const error = await savedRes.json();
              throw new Error(error.message || 'Failed to fetch saved photos');
            }
          } else {
            const savedData = await savedRes.json();
            setSavedPhotos(Array.isArray(savedData) ? savedData : []);
          }
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        setNotif({
          message: error.message || "Failed to load profile data",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId, user]);

  const handleProfilePicUpdate = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/update-pic`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update profile picture');
      }

      const data = await response.json();
      setProfileUser(prev => ({ ...prev, profilePic: data.profilePic }));
      setNotif({
        message: "Profile picture updated successfully!",
        type: "success"
      });
    } catch (error) {
      console.error('Profile pic update error:', error);
      setNotif({
        message: error.message || "Failed to update profile picture",
        type: "error"
      });
    }
  };

  if (loading) {
    return (
      <div className="profile-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: '#f8f8f8',
        borderRadius: '12px',
        margin: '20px'
      }}>
        <img src={LOADING_ANIMATION} alt="Loading..." style={{
          width: '44px',
          height: '44px'
        }} />
      </div>
    );
  }

  if (!profileUser || !profileUser._id) {
    return (
      <div className="profile-container">
        <div className="error-message">
          {notif?.message || "Failed to load profile"}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="profile-container"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {notif && (
        <motion.div 
          className={`notification ${notif.type}`}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
        >
          {notif.message}
        </motion.div>
      )}

      <div className="profile-header">
        <div className="profile-top">
          <motion.div 
            className="avatar-container"
            whileHover={{ scale: 1.03 }}
            variants={slideUp}
            style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#f8f8f8',
              cursor: user?._id === userId ? 'pointer' : 'default'
            }}
            onMouseEnter={() => user?._id === userId && setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => user?._id === userId && fileInputRef.current?.click()}
          >
            {imageLoading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1
              }}>
                <img src={LOADING_ANIMATION} alt="Loading..." style={{
                  width: '44px',
                  height: '44px'
                }} />
              </div>
            )}
            <img
              src={getImageUrl(profileUser.profilePic)}
              alt={profileUser.username}
              className="avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: imageLoading ? '0.5' : '1',
                transition: 'opacity 0.3s ease, filter 0.3s ease',
                filter: isHovering ? 'brightness(0.7)' : 'none'
              }}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
                e.target.onerror = null;
                e.target.src = LOADING_ANIMATION;
              }}
            />
            {user?._id === userId && isHovering && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FontAwesomeIcon icon={faCamera} size="lg" />
                <span style={{ fontSize: '14px' }}>Change Photo</span>
              </div>
            )}
            {user?._id === userId && (
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleProfilePicUpdate}
              />
            )}
          </motion.div>

          <div className="profile-info">
            <motion.div variants={slideUp}>
              <h2>{profileUser.username}</h2>
            </motion.div>

            <motion.div className="stats" variants={slideUp}>
              <div><strong>{photos.length}</strong> posts</div>
              <div><strong>{profileUser.followers?.length || 0}</strong> followers</div>
              <div><strong>{profileUser.following?.length || 0}</strong> following</div>
            </motion.div>

            <motion.div className="bio" variants={slideUp}>
              {isEditing ? (
                <>
                  <textarea 
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)}
                    maxLength={500}
                  />
                </>
              ) : (
                <>
                  <p>{profileUser.bio || "No bio yet"}</p>
                  {profileUser.link && (
                    <a 
                      href={profileUser.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="profile-link"
                    >
                      <FontAwesomeIcon icon={faLink} /> {profileUser.link}
                    </a>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <AnimatePresence>
        {showPortfolio && (
          <motion.div
            className="portfolio-section"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Portfolio content */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="profile-tabs">
        {['posts', 'saved'].map((tab) => (
          <motion.button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Photo Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Photobox 
            photos={activeTab === 'posts' ? photos : savedPhotos}
            loading={loading}
            onDeletePhoto={() => {}}
            onSavePhoto={() => {}}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfilePage;