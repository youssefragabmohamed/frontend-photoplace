import React from "react";
import { Link } from "react-router-dom";

function PhotoCard({ photo }) {
  if (!photo || !photo.url) return null;

  // Calculate a random span between 2-4 for the grid rows
  const rowSpan = Math.floor(Math.random() * 3) + 2;

  return (
    <Link to={`/photo/${photo._id}`} className="photo-card-link">
      <div 
        className="photo-card card"
        style={{
          gridRowEnd: `span ${rowSpan}`,
          height: 'auto'
        }}
      >
        <img
          src={photo.url}
          alt={photo.title || "Photo"}
          className="photo-img"
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'cover'
          }}
        />
        <div className="photo-overlay">
          <p className="photo-title">{photo.title || "Untitled"}</p>
        </div>
      </div>
    </Link>
  );
}

export default PhotoCard;