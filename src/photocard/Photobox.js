import React from "react";
import { Link } from "react-router-dom";
import PlaceholderCard from "./PlaceholderCard";
import "../App.css"; // Use App.css instead of Photobox.css

const Photobox = ({ photos, loading, onDeletePhoto }) => {
  if (loading) {
    return (
      <div className="photo-grid">
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

        return (
          <Link to={`/photo/${photo._id}`} key={photo._id} className="photo-card-link">
            <div className="masonry-item">
              <img
                src={photo.url.startsWith("http") ? photo.url : `${process.env.REACT_APP_API_URL}${photo.url}`}
                alt={photo.title || "No Title"}
                className="masonry-img"
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
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Photobox;