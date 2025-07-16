import React, { useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import "../App.css";

const PhotoBox = ({ 
  photos = [], 
  loading, 
  lastPhotoRef,
  loadingMore
}) => {
  const containerRef = useRef(null);
  const [imageLoadStates, setImageLoadStates] = useState({});

  // Helper function to get full image URL with fallback
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const apiUrl = process.env.REACT_APP_API_URL || '';
    if (!apiUrl) {
      console.warn('REACT_APP_API_URL is not defined');
      return url;
    }
    return `${apiUrl}${url}`;
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
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              ease: "easeOut"
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="photo-item"
          >
            <Link 
              to={`/photos/${photo._id}`} 
              style={{ 
                display: "block", 
                width: "100%", 
                height: "100%",
                textDecoration: "none"
              }}
              tabIndex={0}
            >
              <motion.img
                src={getImageUrl(photo.url)}
                alt={photo.title || "Photo"}
                onLoad={() => handleImageLoad(photo._id)}
                onError={() => handleImageError(photo._id)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "4px",
                  display: "block",
                  transition: "transform 0.2s ease"
                }}
                loading="lazy"
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoadStates[photo._id] === 'loaded' ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              {imageLoadStates[photo._id] !== 'loaded' && (
                <motion.div
                  className="image-placeholder"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    borderRadius: "4px"
                  }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </Link>
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