import React from "react";
import { Link } from "react-router-dom";
import PlaceholderCard from "./PlaceholderCard";

const Photobox = ({ photos, loading, onDeletePhoto }) => {
  if (loading) {
    return (
      <div className="masonry-grid">
        {Array.from({ length: 10 }).map((_, index) => (
          <PlaceholderCard key={`placeholder-${index}`} index={index} />
        ))}
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
    <div className="masonry-grid">
      {photos.map((photo) => {
        if (!photo._id || !photo.url) return null;
        
        // Calculate aspect ratio if available
        const aspectRatio = photo.height && photo.width 
          ? Math.round(photo.height / photo.width * 100) / 100 
          : 1.5;
        
        return (
          <div 
            key={photo._id}
            className="masonry-item card"
            style={{ 
              '--row-span': Math.round(aspectRatio * 20),
              '--aspect-ratio': aspectRatio
            }}
            data-aspect-ratio={aspectRatio}
          >
            <Link to={`/photo/${photo._id}`} className="masonry-item-link">
              <img
                src={photo.url.startsWith("http") ? photo.url : `${process.env.REACT_APP_API_URL}${photo.url}`}
                alt={photo.title || "No Title"}
                className="masonry-img"
                onLoad={(e) => {
                  // Update aspect ratio when image loads
                  if (e.target.naturalHeight && e.target.naturalWidth) {
                    const ratio = e.target.naturalHeight / e.target.naturalWidth;
                    e.target.closest('.masonry-item').style.setProperty(
                      '--row-span', 
                      Math.round(ratio * 20)
                    );
                  }
                }}
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
    </div>
  );
};

export default Photobox;