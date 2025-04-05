import React, { useState, useEffect } from "react";
import PhotoBox from "./Photobox";

const PhotoGallery = ({ photos, loading, onDeletePhoto }) => {
  const [error, setError] = useState(null);

  const handleDelete = async (photoId) => {
    try {
      await onDeletePhoto(photoId);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container">
      {error && <div className="error-message">{error}</div>}
      <PhotoBox
        photos={photos}
        loading={loading}
        onDeletePhoto={handleDelete}
      />
    </div>
  );
};

export default PhotoGallery;