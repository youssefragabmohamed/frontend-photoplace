import React from "react";
import { Link } from "react-router-dom";

function PhotoCard({ photo }) {
  if (!photo || !photo.url) return null;

  return (
    <Link to={`/photo/${photo._id}`} className="photo-card-link">
      <div className="photo-card card">
        <img
          src={photo.url}
          alt={photo.title || "Photo"}
          className="photo-img"
        />
        <div className="photo-overlay">
          <p className="photo-title">{photo.title || "Untitled"}</p>
        </div>
      </div>
    </Link>
  );
}

export default PhotoCard;