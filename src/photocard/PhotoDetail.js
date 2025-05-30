import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faBookmark, faShare, faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart, faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';
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

const PhotoDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState(null);

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return LOADING_ANIMATION;
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_URL}${url}`;
  };

  useEffect(() => {
    fetchPhotoDetails();
  }, [id]);

  const fetchPhotoDetails = async () => {
    try {
      const [photoResponse, savedResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/photos/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }),
        fetch(`${process.env.REACT_APP_API_URL}/api/photos/saved`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        })
      ]);

      if (!photoResponse.ok) throw new Error('Failed to fetch photo details');

      const [photoData, savedData] = await Promise.all([
        photoResponse.json(),
        savedResponse.json()
      ]);

      setPhoto(photoData);
      setIsSaved(savedData.some(savedPhoto => savedPhoto._id === id));
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

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/save/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to save photo');

      const data = await response.json();
      setIsSaved(data.isSaved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/like/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to like photo');

      const data = await response.json();
      setIsLiked(data.isLiked);
      setPhoto(prev => ({
        ...prev,
        likes: data.isLiked ? prev.likes + 1 : prev.likes - 1,
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete photo');

      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setError('Link copied to clipboard!');
    setTimeout(() => setError(null), 3000);
  };

  const handleDownload = () => {
    if (!photo?.url) return;
    const link = document.createElement('a');
    link.href = `${process.env.REACT_APP_API_URL}${photo.url}`;
    link.download = `photo-${id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const isOwner = user?._id === photo.userId;

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
          <div className="photo-header">
            <h2>{photo.title}</h2>
            <div className="photo-actions">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={`action-button ${isLiked ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faHeart} />
                <span>{photo.likes || 0}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className={`action-button ${isSaved ? 'active' : ''}`}
                disabled={saving}
              >
                <FontAwesomeIcon icon={isSaved ? faBookmark : farBookmark} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="action-button"
              >
                <FontAwesomeIcon icon={faShare} />
                <span>Share</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="action-button"
              >
                <FontAwesomeIcon icon={faDownload} />
                <span>Download</span>
              </motion.button>

              {isOwner && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="action-button delete"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span>Delete</span>
                </motion.button>
              )}
            </div>
          </div>

          <p className="description">{photo.description}</p>
          
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