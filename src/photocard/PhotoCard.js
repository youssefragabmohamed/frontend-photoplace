import React from "react";
import { Link } from "react-router-dom";

function PhotoCard({ photo }) {
  console.log("Rendering PhotoCard for:", photo);

  if (!photo || !photo.url) {
    console.error("PhotoCard received invalid photo:", photo);
    return null;
  }

  return (
    <Link to={`/photo/${photo._id}`} className="photo-card-link">
      <div className="photo-card">
        <img
          src={photo.url.startsWith("http") ? photo.url : `https://photoplace-backend.onrender.com${photo.url}`} // Updated backend URL
          alt={photo.title || "Photo"}
          className="photo-img"
        />
        <p className="photo-title">{photo.title || "Untitled"}</p>
      </div>
    </Link>
  );
}

export default PhotoCard;