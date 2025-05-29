import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHeart, faComment, faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import Notification from "./Notification";

// Loading animation as data URL
const LOADING_ANIMATION = `data:image/svg+xml;base64,${btoa(`
<svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="#888">
    <g fill="none" fill-rule="evenodd" stroke-width="2">
        <circle cx="22" cy="22" r="1">
            <animate attributeName="r" begin="0s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
            <animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
        </circle>
        <circle cx="22" cy="22" r="1">
            <animate attributeName="r" begin="-0.9s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
            <animate attributeName="stroke-opacity" begin="-0.9s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
        </circle>
    </g>
</svg>`)}`;

const PhotoDetail = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [notif, setNotif] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return LOADING_ANIMATION;
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_URL}${url}`;
  };

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
        
        // Check if photo is saved
        const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setIsSaved(userData.user.savedPhotos.includes(data._id));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id]);

  const handleSavePhoto = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/save/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to save photo');
      
      const data = await response.json();
      setIsSaved(data.isSaved);
      setNotif({
        message: data.isSaved ? "Photo saved!" : "Photo removed from saved",
        type: "success"
      });
    } catch (err) {
      setNotif({
        message: err.message || "Failed to save photo",
        type: "error"
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: '#f8f8f8',
        borderRadius: '12px',
        margin: '20px'
      }}>
        <img src={LOADING_ANIMATION} alt="Loading..." style={{
          width: '44px',
          height: '44px'
        }} />
      </div>
    );
  }
  
  if (error) return <div className="error">{error}</div>;
  if (!photo) return <div className="not-found">Photo not found</div>;

  return (
    <div className="photo-detail-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}
      
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
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative',
          backgroundColor: '#f8f8f8'
        }}>
          {imageLoading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1
            }}>
              <img src={LOADING_ANIMATION} alt="Loading..." style={{
                width: '44px',
                height: '44px'
              }} />
            </div>
          )}
          <img 
            src={getImageUrl(photo.url)}
            alt={photo.title} 
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              opacity: imageLoading ? '0.5' : '1',
              transition: 'opacity 0.3s ease'
            }}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              setImageLoading(false);
              e.target.onerror = null;
              e.target.src = LOADING_ANIMATION;
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
            <button 
              className="btn btn-outline" 
              onClick={handleSavePhoto}
              style={{
                color: isSaved ? 'var(--primary)' : 'inherit'
              }}
            >
              <FontAwesomeIcon icon={isSaved ? faBookmarkSolid : faBookmarkRegular} /> 
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
          
          <div className="uploader-info" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '30px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#f8f8f8',
              position: 'relative'
            }}>
              <img 
                src={getImageUrl(photo.userId?.profilePic)}
                alt={photo.userId?.username || 'User'} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = LOADING_ANIMATION;
                }}
              />
            </div>
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