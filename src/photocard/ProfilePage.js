import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUserEdit, faLink } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Photobox from "./Photobox";
import '../App.css'; // New CSS file

// Loading animation as data URL for consistent loading state
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
  const [profileUser, setProfileUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
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
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileUser(data.user);
        setPhotos(data.photos || []);

        // Fetch saved photos if viewing own profile
        if (user && user._id === userId) {
          const savedResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          if (savedResponse.ok) {
            const savedData = await savedResponse.json();
            setSavedPhotos(savedData.user.savedPhotos || []);
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setNotif({
          message: error.message || 'Failed to load profile',
          type: 'error'
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

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setNotif({
        message: 'Please upload a valid image file (JPEG, PNG, or GIF)',
        type: 'error'
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setNotif({
        message: 'File size must be less than 5MB',
        type: 'error'
      });
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', file);

    setUploadLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/update-pic`, {
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
        message: 'Profile picture updated successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Profile pic update error:', error);
      setNotif({
        message: error.message || 'Failed to update profile picture',
        type: 'error'
      });
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container loading-state">
        <img src={LOADING_ANIMATION} alt="Loading..." className="loading-spinner" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-container error-state">
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
          onAnimationComplete={() => {
            setTimeout(() => setNotif(null), 3000);
          }}
        >
          {notif.message}
        </motion.div>
      )}

      <div className="profile-header">
        <motion.div 
          className="avatar-container"
          whileHover={{ scale: 1.03 }}
          variants={slideUp}
          style={{
            position: 'relative',
            cursor: user?._id === userId ? 'pointer' : 'default'
          }}
          onMouseEnter={() => user?._id === userId && setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => user?._id === userId && fileInputRef.current?.click()}
        >
          {(imageLoading || uploadLoading) && (
            <div className="loading-overlay">
              <img src={LOADING_ANIMATION} alt="Loading..." className="loading-spinner" />
            </div>
          )}
          
          <img
            src={getImageUrl(profileUser.profilePic)}
            alt={profileUser.username}
            className="avatar"
            style={{
              opacity: (imageLoading || uploadLoading) ? 0.5 : 1,
              filter: isHovering ? 'brightness(0.7)' : 'none'
            }}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              setImageLoading(false);
              e.target.src = LOADING_ANIMATION;
            }}
          />
          
          {user?._id === userId && isHovering && (
            <div className="avatar-overlay">
              <FontAwesomeIcon icon={faCamera} size="lg" />
              <span>Change Photo</span>
            </div>
          )}
          
          {user?._id === userId && (
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/jpeg,image/png,image/gif"
              onChange={handleProfilePicUpdate}
            />
          )}
        </motion.div>

        <div className="profile-info">
          <motion.h2 variants={slideUp}>{profileUser.username}</motion.h2>
          
          <motion.div className="stats" variants={slideUp}>
            <div><strong>{photos.length}</strong> posts</div>
            <div><strong>{profileUser.followers?.length || 0}</strong> followers</div>
            <div><strong>{profileUser.following?.length || 0}</strong> following</div>
          </motion.div>

          <motion.div className="bio" variants={slideUp}>
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
          </motion.div>
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
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfilePage;