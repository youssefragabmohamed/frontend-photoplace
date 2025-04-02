import React, { useState, useEffect } from "react";
import PhotoBox from "./Photobox";

const PhotoGallery = ({ onDeletePhoto }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = () => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/photos`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid API response");
        setPhotos(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => fetchPhotos(), []);

  const handleDeletePhoto = async (photoId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPhotos(prev => prev.filter(photo => photo._id !== photoId));
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  return (
    <div className="container">
      <PhotoBox
        photos={photos}
        loading={loading}
        onDeletePhoto={onDeletePhoto || handleDeletePhoto}
      />
    </div>
  );
};

export default PhotoGallery;