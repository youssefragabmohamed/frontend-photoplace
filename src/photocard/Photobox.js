import React from "react";
import Masonry from "react-masonry-css";
import { Link } from "react-router-dom";
import PlaceholderCard from "./PlaceholderCard";
import "../App.css";

const PhotoBox = ({ photos, loading, onDeletePhoto, selectedTab }) => {
  // Updated breakpoints for responsive columns
  const breakpointColumnsObj = {
    default: 5,    // 5 columns on large screens (laptop/desktop)
    1200: 4,       // 4 columns on medium-large screens
    900: 3,        // 3 columns on tablets
    600: 2         // 2 columns on all phones
  };

  // Filter photos based on selected tab
  const filteredPhotos = photos.filter((photo) => {
    if (selectedTab === 'gallery') {
      return photo.location === 'gallery'; // Assuming photo has a 'location' field
    }
    if (selectedTab === 'profile') {
      return photo.location === 'profile'; // Assuming photo has a 'location' field
    }
    return true; // Default case for other tabs
  });

  if (loading) {
    return (
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <PlaceholderCard key={`placeholder-${index}`} index={index} />
        ))}
      </Masonry>
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
  );
};

export default PhotoBox;
