import React from 'react';

function PhotoCard({ photo }) {
  return (
    <div className="photo-card">
      <img src={photo.url} alt={photo.title} />
      <p>{photo.title}</p>
    </div>
  );
}

export default PhotoCard;
