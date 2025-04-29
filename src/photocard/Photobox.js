import React from "react";
import Masonry from "react-masonry-css";
import { Link, useNavigate } from "react-router-dom";
import PlaceholderCard from "./PlaceholderCard";
import "../App.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';

const PhotoBox = ({ photos, loading, onDeletePhoto, selectedTab, onSavePhoto, showSaveButton, savedPhotos, refreshPhotos }) => {
  const navigate = useNavigate();

  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    900: 2,
    600: 1
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
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
      if (refreshPhotos) refreshPhotos(); // Refresh photos after deletion
    }
  };

  const handleSave = (photoId, e) => {
    e.preventDefault();
    e.stopPropagation();
    onSavePhoto(photoId);
    if (refreshPhotos) refreshPhotos(); // Refresh photos after saving
  };

  return (
    <div className="masonry-container">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {photos.map((photo) => {
          if (!photo._id || !photo.url) return null;

          return (
            <div key={photo._id} className="masonry-item">
              <Link 
                to={`/photos/${photo._id}`} 
                className="masonry-item-link" 
                style={{ display: "block", position: "relative" }}
              >
                <img
                  src={photo.url.startsWith("http") ? photo.url : `${process.env.REACT_APP_API_URL}${photo.url}`}
                  alt={photo.title || "No Title"}
                  style={{
                    width: "100%",
                    borderRadius: "var(--radius-md)",
                    display: "block"
                  }}
                  loading="lazy"
                />
                <div className="photo-overlay">
                  <p className="photo-title">{photo.title}</p>
                  <button
                    className="btn btn-danger"
                    onClick={(e) => handleDelete(photo._id, e)}
                    style={{
                      position: "absolute",
                      top: "var(--space-sm)",
                      right: "var(--space-sm)",
                      padding: "var(--space-xs)"
                    }}
                  >
                    Delete
                  </button>
                  <button 
                    onClick={(e) => handleSave(photo._id, e)}
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'rgba(0,0,0,0.5)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <FontAwesomeIcon icon={savedPhotos.includes(photo._id) ? faBookmarkSolid : faBookmarkRegular} />
                  </button>
                  {showSaveButton && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onAddToPortfolio(photo._id);
                        if (refreshPhotos) refreshPhotos(); // Refresh photos after adding to portfolio
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '50px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Add to Portfolio
                    </button>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </Masonry>
    </div>
  );
};

export default PhotoBox;