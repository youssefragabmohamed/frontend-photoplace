import React, { useState, useEffect } from "react";
import PhotoBox from "./Photobox"; // Updated import statement for PhotoBox

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = () => {
    setLoading(true);
    console.log("Fetching photos from API..."); // Debugging log
    fetch("https://photoplace-backend.onrender.com/photos") // Updated backend URL
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("API Response Data:", data); // Debugging log
        if (!Array.isArray(data)) {
          throw new Error("Invalid API response: Expected an array.");
        }
        setPhotos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching photos:", error); // Debugging log
        setLoading(false);
      });
  };

  useEffect(() => {
    console.log("Component mounted. Fetching photos..."); // Debugging log
    fetchPhotos();
  }, []);

  return (
    <div className="photo-gallery">
      <PhotoBox photos={photos} loading={loading} /> {/* Use PhotoBox component */}
    </div>
  );
};

export default PhotoGallery;