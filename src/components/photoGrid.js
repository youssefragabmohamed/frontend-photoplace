import React from 'react';
import PhotoCard from './photocard/PhotoCard'; // Correct import for PhotoCard

function PhotoGrid({ photos }) {
  return (
    <div className="photo-grid">
      {photos.length > 0 ? (
        photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))
      ) : (
        <p>No photos found.</p>
      )}
    </div>
  );
}

export default PhotoGrid;
