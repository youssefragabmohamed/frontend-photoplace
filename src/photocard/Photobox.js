import React, { useState, useEffect, useRef } from "react";
import Masonry from "react-masonry-css";
import { Link, useNavigate } from "react-router-dom";
import PlaceholderCard from "./PlaceholderCard";
import "../App.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const PhotoBox = ({ 
  photos = [], 
  loading, 
  onDeletePhoto, 
  selectedTab, 
  onSavePhoto, 
  showSaveButton, 
  savedPhotos = [], 
  refreshPhotos,
  lastPhotoRef,
  loadingMore
}) => {
  const navigate = useNavigate();
  const [pullDistance, setPullDistance] = useState(0);
  const [bottomPullDistance, setBottomPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isPullingBottom, setIsPullingBottom] = useState(false);
  const containerRef = useRef(null);

  // Updated breakpoints for better mobile experience
  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    900: 2,
    600: 2  // 2 columns on mobile
  };

  // Helper function to get full image URL with fallback
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Ensure we have a valid API URL
    const apiUrl = process.env.REACT_APP_API_URL || '';
    if (!apiUrl) {
      console.warn('REACT_APP_API_URL is not defined');
      return url; // Return the original URL as fallback
    }
    
    return `${apiUrl}${url}`;
  };

  // Generate placeholder cards to fill empty spaces - Pinterest style
  const generatePlaceholders = (count = 20) => {
    const placeholders = [];
    
    for (let i = 0; i < count; i++) {
      placeholders.push(
        <PlaceholderCard key={`placeholder-${i}`} index={i} />
      );
    }
    return placeholders;
  };

  // Check if scrolled to bottom
  const isAtBottom = () => {
    if (!containerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
  };

  // Check if scrolled to top
  const isAtTop = () => {
    if (!containerRef.current) return false;
    return containerRef.current.scrollTop === 0;
  };

  // Pull to refresh handlers
  const handleTouchStart = (e) => {
    const touchY = e.touches[0].clientY;
    setStartY(touchY);
    
    if (isAtTop()) {
      setIsPulling(true);
    } else if (isAtBottom()) {
      setIsPullingBottom(true);
    }
  };

  const handleTouchMove = (e) => {
    if ((!isPulling && !isPullingBottom) || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (isPulling && distance > 0 && isAtTop()) {
      // Pull down from top
      const pullAmount = Math.min(distance * 0.5, 120);
      setPullDistance(pullAmount);
      e.preventDefault();
    } else if (isPullingBottom && distance < 0 && isAtBottom()) {
      // Pull up from bottom
      const pullAmount = Math.min(Math.abs(distance) * 0.5, 120);
      setBottomPullDistance(pullAmount);
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling && !isPullingBottom) return;
    
    if (isPulling) {
      setIsPulling(false);
      
      if (pullDistance > 80) {
        // Trigger refresh from top
        setIsRefreshing(true);
        setPullDistance(0);
        
        if (refreshPhotos) {
          await refreshPhotos();
        }
        
        setTimeout(() => {
          setIsRefreshing(false);
        }, 1000);
      } else {
        setPullDistance(0);
      }
    }
    
    if (isPullingBottom) {
      setIsPullingBottom(false);
      
      if (bottomPullDistance > 80) {
        // Trigger refresh from bottom
        setIsRefreshing(true);
        setBottomPullDistance(0);
        
        if (refreshPhotos) {
          await refreshPhotos();
        }
        
        setTimeout(() => {
          setIsRefreshing(false);
        }, 1000);
      } else {
        setBottomPullDistance(0);
      }
    }
  };

  // Mouse events for desktop
  const handleMouseDown = (e) => {
    const mouseY = e.clientY;
    setStartY(mouseY);
    
    if (isAtTop()) {
      setIsPulling(true);
    } else if (isAtBottom()) {
      setIsPullingBottom(true);
    }
  };

  const handleMouseMove = (e) => {
    if ((!isPulling && !isPullingBottom) || isRefreshing) return;
    
    const distance = e.clientY - startY;
    
    if (isPulling && distance > 0 && isAtTop()) {
      const pullAmount = Math.min(distance * 0.5, 120);
      setPullDistance(pullAmount);
    } else if (isPullingBottom && distance < 0 && isAtBottom()) {
      const pullAmount = Math.min(Math.abs(distance) * 0.5, 120);
      setBottomPullDistance(pullAmount);
    }
  };

  const handleMouseUp = handleTouchEnd;

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isPulling, isPullingBottom, isRefreshing, pullDistance, bottomPullDistance, startY]);

  // Show loading placeholders when loading and no photos
  if (loading && photos.length === 0) {
    return (
      <div className="masonry-container" ref={containerRef}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {generatePlaceholders(24)} {/* Show more placeholders when loading */}
        </Masonry>
      </div>
    );
  }

  // Show placeholders when no photos (Pinterest style)
  if (!photos || photos.length === 0) {
    return (
      <div className="masonry-container" ref={containerRef}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {generatePlaceholders(20)} {/* Fill screen with placeholders */}
        </Masonry>
        <div className="empty-gallery-overlay" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 10
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
            {selectedTab === 'saved' ? 'No saved photos yet' : 'No photos found'}
          </p>
          {selectedTab !== 'saved' && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/upload')}
            >
              Upload Your First Photo
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleDelete = (photoId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this photo?")) {
      onDeletePhoto(photoId);
      if (refreshPhotos) refreshPhotos();
    }
  };

  const handleSave = (photoId, e) => {
    e.preventDefault();
    e.stopPropagation();
    onSavePhoto(photoId);
    if (refreshPhotos) refreshPhotos();
  };

  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    console.warn('Image failed to load:', e.target.src);
    
    // Try to reload the image once with a slight delay
    const originalSrc = e.target.src;
    setTimeout(() => {
      if (e.target.src === originalSrc) {
        // If the image still hasn't loaded, use a simple placeholder
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
      }
    }, 1000);
  };

  // Combine real photos with placeholder cards to fill remaining space
  const generateFillPlaceholders = () => {
    const placeholders = [];
    const numPlaceholders = Math.max(0, 16 - photos.length); // Fill up to 16 total items
    
    for (let i = 0; i < numPlaceholders; i++) {
      placeholders.push(
        <PlaceholderCard key={`fill-placeholder-${i}`} index={i + photos.length} />
      );
    }
    return placeholders;
  };

  // Combine real photos with placeholder cards
  const allItems = [
    ...photos.filter(photo => photo && photo._id && photo.url).map((photo, index) => (
      <div 
        key={photo._id} 
        className="masonry-item"
        ref={index === photos.length - 1 ? lastPhotoRef : null}
      >
        <Link 
          to={`/photos/${photo._id}`} 
          className="masonry-item-link" 
          style={{ display: "block", position: "relative" }}
        >
          <img
            src={getImageUrl(photo.url)}
            alt={photo.title || "No Title"}
            style={{
              width: "100%",
              borderRadius: "var(--radius-md)",
              display: "block"
            }}
            loading="lazy"
            onError={handleImageError}
          />
          <div className="photo-overlay">
            <h3 className="photo-title">{photo.title}</h3>
            <div className="photo-actions">
              {showSaveButton && (
                <button
                  className={`action-button ${savedPhotos.includes(photo._id) ? 'active' : ''}`}
                  onClick={(e) => handleSave(photo._id, e)}
                >
                  <FontAwesomeIcon 
                    icon={savedPhotos.includes(photo._id) ? faBookmarkSolid : faBookmarkRegular} 
                  />
                </button>
              )}
              {photo.userId === localStorage.getItem('userId') && (
                <button
                  className="action-button delete"
                  onClick={(e) => handleDelete(photo._id, e)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </Link>
      </div>
    )),
    ...generateFillPlaceholders()
  ];

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    if (refreshPhotos) {
      await refreshPhotos();
    }
    
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="masonry-container" ref={containerRef}>
      {/* Manual refresh button */}
      <div 
        className="manual-refresh-button"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1001,
          opacity: 0,
          transition: 'opacity 0.3s ease, transform 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0';
          e.target.style.transform = 'scale(1)';
        }}
        onClick={handleManualRefresh}
      >
        <div 
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <FontAwesomeIcon 
            icon={faSyncAlt} 
            style={{
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              fontSize: '18px'
            }}
          />
        </div>
      </div>

      {/* Top pull to refresh indicator */}
      <div 
        className="pull-to-refresh-indicator top-indicator"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          opacity: pullDistance > 0 ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
      >
        <div 
          className="refresh-icon"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-md)',
            transform: `rotate(${pullDistance * 2}deg) scale(${1 + pullDistance / 200})`,
            transition: 'transform 0.1s ease'
          }}
        >
          <FontAwesomeIcon 
            icon={faSyncAlt} 
            style={{
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
            }}
          />
        </div>
        <div 
          className="refresh-text"
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            fontWeight: 500
          }}
        >
          {isRefreshing ? 'Refreshing...' : pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      </div>

      {/* Bottom pull to refresh indicator */}
      <div 
        className="pull-to-refresh-indicator bottom-indicator"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          opacity: bottomPullDistance > 0 ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
      >
        <div 
          className="refresh-icon"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-md)',
            transform: `rotate(${-bottomPullDistance * 2}deg) scale(${1 + bottomPullDistance / 200})`,
            transition: 'transform 0.1s ease'
          }}
        >
          <FontAwesomeIcon 
            icon={faSyncAlt} 
            style={{
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
            }}
          />
        </div>
        <div 
          className="refresh-text"
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            fontWeight: 500
          }}
        >
          {isRefreshing ? 'Refreshing...' : bottomPullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      </div>

      {/* Content with pull offset */}
      <div 
        style={{
          transform: `translateY(${pullDistance - bottomPullDistance}px)`,
          transition: isRefreshing ? 'transform 0.3s ease' : 'none'
        }}
      >
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {allItems}
        </Masonry>
        {loadingMore && (
          <div className="loading-more">
            <div className="spinner"></div>
            <p>Loading more photos...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoBox;