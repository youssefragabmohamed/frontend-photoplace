import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faBookmark, faShare, faDownload } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';

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

const PhotoDetail = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [notif, setNotif] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return LOADING_ANIMATION;
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_URL}${url}`;
  };

  useEffect(() => {
    const fetchPhoto = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error("Photo not found");
        
        const data = await response.json();
        setPhoto(data);
        
        // Check if photo is saved
        const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setIsSaved(userData.user.savedPhotos.includes(data._id));
        }
      } catch (err) {
        setError(err.message);
        setNotif({
          message: err.message,
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id]);

  if (loading) {
    return (
      <div className="photo-detail-container loading-state">
        <img src={LOADING_ANIMATION} alt="Loading..." className="loading-spinner" />
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="photo-detail-container error-state">
        <div className="error-message">
          {error || "Failed to load photo"}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="photo-detail-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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

      <div className="photo-detail-content">
        <div className="photo-container">
          {imageLoading && (
            <div className="loading-overlay">
              <img src={LOADING_ANIMATION} alt="Loading..." className="loading-spinner" />
            </div>
          )}
          <img
            src={getImageUrl(photo.url)}
            alt={photo.title}
            className="photo-image"
            style={{
              opacity: imageLoading ? 0.5 : 1,
              transition: 'opacity 0.3s ease'
            }}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              setImageLoading(false);
              e.target.src = LOADING_ANIMATION;
            }}
          />
        </div>

        <div className="photo-info">
          <h2>{photo.title}</h2>
          <p className="description">{photo.description}</p>
          
          <div className="photo-actions">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="action-button"
            >
              <FontAwesomeIcon icon={faHeart} className={photo.isLiked ? 'liked' : ''} />
              <span>{photo.likes?.length || 0}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="action-button"
            >
              <FontAwesomeIcon icon={faBookmark} className={isSaved ? 'saved' : ''} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="action-button"
            >
              <FontAwesomeIcon icon={faShare} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="action-button"
            >
              <FontAwesomeIcon icon={faDownload} />
            </motion.button>
          </div>

          <div className="uploader-info">
            <div className="avatar-container">
              <img 
                src={getImageUrl(photo.userId?.profilePic)}
                alt={photo.userId?.username || 'User'} 
                className="avatar"
                onError={(e) => {
                  e.target.src = LOADING_ANIMATION;
                }}
              />
            </div>
            <div className="user-info">
              <p className="username" onClick={() => navigate(`/profile/${photo.userId?._id}`)}>
                {photo.userId?.username || 'Unknown'}
              </p>
              <p className="upload-date">
                {new Date(photo.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PhotoDetail;