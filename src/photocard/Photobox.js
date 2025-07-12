import React, { useState, useEffect, useRef } from "react";
import Masonry from "react-masonry-css";
import { Link, useNavigate } from "react-router-dom";
import PlaceholderCard from "./PlaceholderCard";
import "../App.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';

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
  const [showBottomLoader, setShowBottomLoader] = useState(false);
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
  // Calculate based on number of columns to ensure 4 per column
  const generatePlaceholders = (count = 16) => {
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
    return scrollTop + clientHeight >= scrollHeight - 50; // Increased threshold
  };

  // Scroll handler for bottom loading indicator
  const handleScroll = () => {
    if (isAtBottom() && !loadingMore && !showBottomLoader) {
      setShowBottomLoader(true);
      // Hide after 2 seconds if no loading starts
      setTimeout(() => {
        if (!loadingMore) {
          setShowBottomLoader(false);
        }
      }, 2000);
    } else if (!isAtBottom()) {
      setShowBottomLoader(false);
    }
  };

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [loadingMore]);

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

  // Calculate placeholders needed to ensure 4 per column
  const getColumnsCount = () => {
    const width = window.innerWidth;
    if (width >= 1200) return 4;
    if (width >= 900) return 3;
    if (width >= 600) return 2;
    return 2;
  };

  // Generate fill placeholders to ensure 4 per column
  const generateFillPlaceholders = () => {
    const columnsCount = getColumnsCount();
    const targetItemsPerColumn = 4;
    const totalTargetItems = columnsCount * targetItemsPerColumn;
    const currentItems = photos.length;
    const neededPlaceholders = Math.max(0, totalTargetItems - currentItems);
    
    // Add extra placeholders to ensure content extends to bottom of screen
    const extraPlaceholders = Math.max(0, 8 - neededPlaceholders);
    const totalPlaceholders = neededPlaceholders + extraPlaceholders;
    
    const placeholders = [];
    for (let i = 0; i < totalPlaceholders; i++) {
      placeholders.push(
        <PlaceholderCard key={`fill-placeholder-${i}`} index={i + currentItems} />
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
          style={{ 
            display: "block", 
            position: "relative",
            textDecoration: "none",
            WebkitTapHighlightColor: "transparent",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            userSelect: "none"
          }}
        >
          <div className="photo-container" style={{
            position: "relative",
            borderRadius: "8px", // Smaller rounded corners - Instagram style
            overflow: "hidden",
            transition: "transform 0.2s ease, box-shadow 0.2s ease"
          }}>
            <img
              src={getImageUrl(photo.url)}
              alt={photo.title || "No Title"}
              style={{
                width: "100%",
                borderRadius: "8px", // Smaller rounded corners - Instagram style
                display: "block",
                transition: "transform 0.2s ease"
              }}
              loading="lazy"
              onError={handleImageError}
            />
            
            {/* Hover overlay - only shows save button on hover */}
            <div className="photo-overlay" style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.2) 100%)",
              opacity: 0,
              transition: "opacity 0.2s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-end",
              padding: "16px"
            }}>
              <div className="photo-actions" style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px"
              }}>
                {showSaveButton && (
                  <button
                    className="action-button"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      color: savedPhotos.includes(photo._id) ? "var(--primary)" : "var(--text-secondary)"
                    }}
                    onClick={(e) => handleSave(photo._id, e)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.1)";
                      e.target.style.background = "rgba(255, 255, 255, 1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.background = "rgba(255, 255, 255, 0.9)";
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={savedPhotos.includes(photo._id) ? faBookmarkSolid : faBookmarkRegular} 
                    />
                  </button>
                )}
                {photo.userId === localStorage.getItem('userId') && (
                  <button
                    className="action-button delete"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      color: "#e74c3c",
                      fontSize: "12px"
                    }}
                    onClick={(e) => handleDelete(photo._id, e)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.1)";
                      e.target.style.background = "rgba(255, 255, 255, 1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.background = "rgba(255, 255, 255, 0.9)";
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Description under photo - shows when there's space */}
          {(photo.description || photo.user?.username) && (
            <div className="photo-description" style={{
              padding: "12px 0 8px 0",
              lineHeight: "1.4"
            }}>
              {photo.title && (
                <h4 style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  margin: "0 0 4px 0",
                  color: "var(--text-primary)",
                  lineHeight: "1.3"
                }}>
                  {photo.title}
                </h4>
              )}
              {photo.description && (
                <p style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  margin: "0 0 4px 0",
                  lineHeight: "1.4",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {photo.description}
                </p>
              )}
              {photo.user?.username && (
                <p style={{
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                  margin: 0,
                  fontWeight: "500"
                }}>
                  by {photo.user.username}
                </p>
              )}
            </div>
          )}
        </Link>
      </div>
    )),
    ...generateFillPlaceholders()
  ];

  return (
    <div className="masonry-container" ref={containerRef}>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {allItems}
      </Masonry>
      
      {/* Bottom loading indicator - Instagram style */}
      {(loadingMore || showBottomLoader) && (
        <div className="loading-more" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          marginTop: '20px'
        }}>
          <div 
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid var(--primary)',
              borderTop: '2px solid transparent',
              animation: 'spin 1s linear infinite',
              marginRight: '12px'
            }}
          />
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '14px',
            margin: 0
          }}>
            {loadingMore ? 'Loading more photos...' : 'Loading...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoBox;