import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import "../App.css";

const PhotoBox = ({ 
  photos = [], 
  loading, 
  lastPhotoRef,
  loadingMore
}) => {
  const containerRef = useRef(null);
  const [imageLoadStates, setImageLoadStates] = useState({});
  // Like state: { [photoId]: { liked: bool, count: number, loading: bool } }
  const [likes, setLikes] = useState({});
  const [saved, setSaved] = useState({});

  // On mount or photos change, initialize like state from backend data
  useEffect(() => {
    const initialLikes = {};
    photos.forEach(photo => {
      if (photo && photo._id) {
        initialLikes[photo._id] = {
          liked: photo.likes && Array.isArray(photo.likes)
            ? photo.likes.includes(localStorage.getItem('userId'))
            : false,
          count: photo.likeCount || (photo.likes ? photo.likes.length : 0),
          loading: false
        };
      }
    });
    setLikes(initialLikes);
  }, [photos]);

  // Fetch saved photos on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch(`${process.env.REACT_APP_API_URL}/api/photos/saved`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const savedMap = {};
        (data.photos || []).forEach(photo => {
          if (photo && photo._id) savedMap[photo._id] = true;
        });
        setSaved(savedMap);
      });
  }, []);

  // Helper function to get full image URL with fallback
  const getImageUrl = (url, photo) => {
    if (!url) {
      console.warn('Photo missing URL:', photo);
      return '';
    }
    if (url.startsWith('http')) return url;
    const apiUrl = process.env.REACT_APP_API_URL || '';
    if (!apiUrl) {
      console.warn('REACT_APP_API_URL is not defined. Photo:', photo);
      return url;
    }
    // Ensure leading slash
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${apiUrl}${cleanUrl}`;
  };

  // Intersection observer for infinite scroll (only at the bottom)
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Trigger load more when last item comes into view
  React.useEffect(() => {
    if (inView && !loadingMore && lastPhotoRef) {
      if (lastPhotoRef.current) {
        lastPhotoRef.current();
      }
    }
  }, [inView, loadingMore, lastPhotoRef]);

  // Handle image load state
  const handleImageLoad = useCallback((photoId) => {
    setImageLoadStates(prev => ({
      ...prev,
      [photoId]: 'loaded'
    }));
  }, []);

  const handleImageError = useCallback((photoId) => {
    setImageLoadStates(prev => ({
      ...prev,
      [photoId]: 'error'
    }));
  }, []);

  const handleLike = async (photoId) => {
    setLikes(prev => ({
      ...prev,
      [photoId]: { ...prev[photoId], loading: true }
    }));
    const token = localStorage.getItem('authToken');
    const isLiked = likes[photoId]?.liked;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setLikes(prev => ({
          ...prev,
          [photoId]: {
            liked: data.liked,
            count: data.likeCount,
            loading: false
          }
        }));
      } else {
        setLikes(prev => ({
          ...prev,
          [photoId]: { ...prev[photoId], loading: false }
        }));
        // Optionally show error toast
      }
    } catch (err) {
      setLikes(prev => ({
        ...prev,
        [photoId]: { ...prev[photoId], loading: false }
      }));
      // Optionally show error toast
    }
  };

  const handleSave = async (photoId) => {
    const token = localStorage.getItem('authToken');
    const isSaved = saved[photoId];
    setSaved(prev => ({ ...prev, [photoId]: !isSaved })); // instant feedback
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}/save`, {
      method: isSaved ? 'DELETE' : 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      setSaved(prev => ({ ...prev, [photoId]: isSaved })); // revert on error
    }
  };

  // Add a utility function to detect mobile
  const isMobile = () => window.innerWidth <= 768;

  // Show loading spinner when loading and no photos
  if (loading && photos.length === 0) {
    return (
      <motion.div 
        className="loading-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading photos...
        </motion.p>
      </motion.div>
    );
  }

  // Show empty state if no photos
  if (!photos || photos.length === 0) {
    return (
      <motion.div 
        className="no-photos"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          No photos yet
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Start uploading to see your gallery here.
        </motion.p>
      </motion.div>
    );
  }

  // Filter valid photos
  const validPhotos = photos.filter(photo => photo && photo._id && photo.url);

  return (
    <div className="instagram-gallery-container" ref={containerRef}>
      <div className="photos-grid">
        {validPhotos.map((photo, index) => (
          <motion.div
            key={photo._id}
            ref={index === validPhotos.length - 1 ? lastPhotoRef : null}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="photo-item"
            style={{ position: 'relative' }}
          >
            <Link
              to={`/photos/${photo._id}`}
              style={{ display: "block", width: "100%", height: "100%", textDecoration: "none" }}
              tabIndex={0}
            >
              <img
                src={getImageUrl(photo.url, photo)}
                alt={photo.title || "Photo"}
                onLoad={() => handleImageLoad(photo._id)}
                onError={e => {
                  handleImageError(photo._id);
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSIxNTAiIHk9IjE1MCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                  console.warn('Image failed to load:', getImageUrl(photo.url, photo), photo);
                }}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px", display: "block", transition: "transform 0.2s ease" }}
                loading="lazy"
              />
            </Link>
            {/* Like/Save buttons only on desktop hover */}
            <div className="photo-actions-hover">
              <button
                className="like-btn"
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', zIndex: 2, opacity: likes[photo._id]?.loading ? 0.6 : 1 }}
                onClick={e => { e.preventDefault(); e.stopPropagation(); if (!likes[photo._id]?.loading) handleLike(photo._id); }}
                disabled={likes[photo._id]?.loading}
              >
                <FontAwesomeIcon icon={likes[photo._id]?.liked ? faHeartSolid : faHeartRegular} style={{ color: likes[photo._id]?.liked ? '#e74c3c' : '#888', fontSize: 20 }} />
              </button>
              <button
                className="save-btn"
                style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', zIndex: 2 }}
                onClick={e => { e.preventDefault(); e.stopPropagation(); handleSave(photo._id); }}
              >
                <FontAwesomeIcon icon={saved[photo._id] ? faBookmarkSolid : faBookmarkRegular} style={{ color: saved[photo._id] ? '#0095f6' : '#888', fontSize: 20 }} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} style={{ height: "20px", width: "100%" }} />

      {/* Bottom loading indicator - Instagram style */}
      <AnimatePresence>
        {loadingMore && (
          <motion.div 
            className="loading-more"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              marginTop: '20px',
              width: '100%'
            }}
          >
            <motion.div 
              className="spinner"
              style={{ width: '24px', height: '24px', marginRight: '12px' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Loading more photos...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoBox;