import React from "react";
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

  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    900: 2,
    600: 1
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

  if (loading && photos.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading photos...</p>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="empty-gallery" style={{
        textAlign: 'center',
        padding: '40px',
        color: 'var(--text-secondary)'
      }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
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

  return (
    <div className="masonry-container">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {photos.filter(photo => photo && photo._id && photo.url).map((photo, index) => (
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
        ))}
      </Masonry>
      {loadingMore && (
        <div className="loading-more">
          <div className="spinner"></div>
          <p>Loading more photos...</p>
        </div>
      )}
    </div>
  );
};

export default PhotoBox;