import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PhotoDetail = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error("Photo not found");
        
        const data = await response.json();
        setPhoto(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!photo) return <div className="not-found">Photo not found</div>;

  return (
    <div className="photo-detail-container">
      <button 
        onClick={() => navigate(-1)} 
        className="back-btn"
      >
        &larr; Back to Gallery
      </button>
      
      <div className="photo-detail-content">
        <img 
          src={photo.url} 
          alt={photo.title} 
          className="photo-detail-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
          }}
        />
        <div className="photo-meta">
          <h2>{photo.title}</h2>
          <p className="description">{photo.description || "No description provided"}</p>
          <p className="upload-info">
            Uploaded by {photo.userId?.username || "Unknown"} • {new Date(photo.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;