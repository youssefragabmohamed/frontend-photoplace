import React from "react";
import Masonry from "react-masonry-css";
import { Link } from "react-router-dom";
import PlaceholderCard from "./PlaceholderCard";
import "../App.css";

const PhotoBox = ({ photos, loading, onDeletePhoto, selectedTab }) => {
  // Updated breakpoints for better responsive columns
  const breakpointColumnsObj = {
    default: 4,    // 4 columns on large screens
    1200: 3,       // 3 columns on medium-large screens
    900: 2,        // 2 columns on tablets
    600: 1         // 1 column on phones (we'll override this)
  };

  // Filter photos based on selected tab
  const filteredPhotos = photos.filter((photo) => {
    if (selectedTab === 'digital') return photo.location === 'digital';
    if (selectedTab === 'traditional') return photo.location === 'traditional';
    return true;
  });

  if (loading) {
    return (
      <div className="masonry-container" style={{ minHeight: '500px' }}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <PlaceholderCard key={`placeholder-${index}`} index={index} />
          ))}
        </Masonry>
      </div>
    );
  }

  const handleDelete = (photoId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this photo?")) {
      onDeletePhoto(photoId);
    }
  };

  return (
    <div className="masonry-container">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {filteredPhotos.map((photo) => {
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
                </div>
              </Link>
            </div>
          );
        })}
      </Masonry>
      
      {/* Empty state when no photos */}
      {filteredPhotos.length === 0 && (
        <div className="empty-gallery">
          <p>No photos found in this category</p>
        </div>
      )}
    </div>
  );
};

export default PhotoBox;