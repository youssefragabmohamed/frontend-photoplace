import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUserEdit, faLink } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Photobox from "./Photobox";
import '../App.css'; // New CSS file

const ProfilePage = ({ user }) => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState({});
  const [photos, setPhotos] = useState([]);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [showPortfolio, setShowPortfolio] = useState(false);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
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

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading...</div>
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
          >
            <img
              src={profileUser.profilePic || '/default-profile.jpg'}
              alt={profileUser.username}
              className="avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-profile.jpg';
              }}
            />
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