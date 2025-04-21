import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHeart, faComment, faBookmark } from '@fortawesome/free-solid-svg-icons';

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
    <div className="photo-detail-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="back-btn"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.2rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Back
      </button>
      
      <div className="photo-detail-content" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1fr)',
        gap: '40px'
      }}>
        <div className="photo-image-container" style={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <img 
            src={photo.url} 
            alt={photo.title} 
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
            }}
          />
        </div>
        
        <div className="photo-meta" style={{
          padding: '20px',
          background: 'var(--glass-bg)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ marginTop: 0 }}>{photo.title}</h2>
          <p className="description" style={{ color: 'var(--text-secondary)' }}>
            {photo.description || "No description provided"}
          </p>
          
          <div className="photo-actions" style={{
            display: 'flex',
            gap: '16px',
            margin: '20px 0'
          }}>
            <button className="btn btn-outline">
              <FontAwesomeIcon icon={faHeart} /> Like
            </button>
            <button className="btn btn-outline">
              <FontAwesomeIcon icon={faComment} /> Comment
            </button>
            <button className="btn btn-outline">
              <FontAwesomeIcon icon={faBookmark} /> Save
            </button>
          </div>
          
          <div className="uploader-info" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '30px'
          }}>
            <img 
              src={photo.userId?.profilePic || '/default-profile.jpg'} 
              alt={photo.userId?.username || 'User'} 
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <p style={{ margin: 0, fontWeight: '600' }}>
                {photo.userId?.username || 'Unknown'}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {new Date(photo.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;