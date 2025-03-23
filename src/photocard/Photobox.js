import React from "react";
import { Link } from "react-router-dom";

const placeholderColors = [
  "#FFDDC1", // Light Peach
  "#FFABAB", // Light Pink
  "#FFC3A0", // Light Coral
  "#D5AAFF", // Light Lavender
  "#85E3FF", // Light Sky Blue
  "#B9FBC0", // Light Mint
  "#FFE4B5", // Light Apricot
  "#D4A5A5", // Light Rose
  "#A5D4FF", // Light Blue
  "#C8A2C8", // Light Lilac
];

const Photobox = ({ photos, loading }) => {
  if (loading) {
    return (
      <div className="photo-grid">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="placeholder-card"
            style={{ backgroundColor: placeholderColors[index % placeholderColors.length] }}
          >
            Loading...
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="photo-grid">
      {photos.map((photo) => {
        if (!photo._id || !photo.url) {
          console.error("Invalid photo object:", photo);
          return null;
        }
        return (
          <Link to={`/photo/${photo._id}`} key={photo._id} className="photo-card-link">
            <div className="photo-card">
              <img
                src={photo.url.startsWith("http") ? photo.url : `https://photoplace-backend-4i8v.onrender.com${photo.url}`} // Updated backend URL
                alt={photo.title || "No Title"}
                className="photo-img"
              />
              <p className="photo-title">{photo.title}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Photobox;