import React from 'react';
import { useNavigate } from 'react-router-dom';

const PhotoGallery = ({ photos, onDeletePhoto }) => {
  const navigate = useNavigate();

  return (
    <div className="photo-gallery">
      {photos.map(photo => (
        <div 
          key={photo._id} 
          className="photo-card"
          onClick={() => navigate(`/photo/${photo._id}`)}
        >
          <img 
            src={photo.url} 
            alt={photo.title} 
            className="photo-thumbnail"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
            }}
          />
          <div className="photo-info">
            <h3>{photo.title}</h3>
            {photo.description && <p>{photo.description}</p>}
          </div>
          <button 
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this photo?')) {
                onDeletePhoto(photo._id);
              }
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default PhotoGallery;