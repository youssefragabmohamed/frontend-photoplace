import React, { useState, useEffect } from "react";
import PhotoBox from "./Photobox"; // Ensure the correct import for PhotoBox

const PhotoGallery = ({ onDeletePhoto }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch photos from the API
  const fetchPhotos = () => {
    setLoading(true);
    console.log("Fetching photos from API..."); // Debugging log
    fetch(`${process.env.REACT_APP_API_URL}/api/photos`) // Use environment variable
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

  // Fetch photos when the component mounts
  useEffect(() => {
    console.log("Component mounted. Fetching photos..."); // Debugging log
    fetchPhotos();
  }, []);

  // Handle photo deletion
  const handleDeletePhoto = async (photoId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Remove the deleted photo from the local state
      setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo._id !== photoId));
      console.log("Photo deleted successfully");
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  return (
    <div className="photo-gallery">
      {/* Pass photos, loading, and onDeletePhoto to PhotoBox */}
      <PhotoBox
        photos={photos}
        loading={loading}
        onDeletePhoto={onDeletePhoto || handleDeletePhoto} // Use passed prop or local handler
      />
    </div>
  );
};

export default PhotoGallery;