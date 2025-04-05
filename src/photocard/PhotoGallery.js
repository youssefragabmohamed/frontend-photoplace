import React, { useState, useEffect } from "react";
import PhotoBox from "./Photobox";

const PhotoGallery = ({ onDeletePhoto }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPhotos = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    
    fetch(`${process.env.REACT_APP_API_URL}/api/photos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid API response");
        setPhotos(data);
      })
      .catch(err => {
        console.error("Error fetching photos:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleDeletePhoto = async (photoId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}`, {
        method: "DELETE",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete photo');
      
      setPhotos(prev => prev.filter(photo => photo._id !== photoId));
    } catch (error) {
      console.error("Error deleting photo:", error);
      setError(error.message);
    }
  };

  return (
    <div className="container">
      {error && <div className="error-message">{error}</div>}
      <PhotoBox
        photos={photos}
        loading={loading}
        onDeletePhoto={onDeletePhoto || handleDeletePhoto}
      />
    </div>
  );
};

export default PhotoGallery;