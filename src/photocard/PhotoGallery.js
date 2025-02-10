
import React, { useState, useEffect } from 'react';
import PhotoCard from './PhotoCard'; // Assuming PhotoCard is in the same folder

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch photos from your API (localhost:5000)
    fetch('http://localhost:5000/api/photos')
      .then((response) => response.json())
      .then((data) => {
        setPhotos(data); // Store the photos in the state
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error('Error fetching photos:', error);
        setLoading(false); // Set loading to false in case of error
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  return (
    <div className="photo-gallery">
      {photos.length > 0 ? (
        photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))
      ) : (
        <p>No photos available.</p>
      )}
    </div>
  );
};

export default PhotoGallery;

