import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PhotoDetail = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${id}`);
        if (!response.ok) throw new Error("Photo not found");
        setPhoto(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id]);

  if (loading) return <div className="skeleton" style={{ height: "200px", borderRadius: "var(--radius-md)" }} />;
  if (error) return <div className="notification error">{error}</div>;
  if (!photo) return <div>Photo not found!</div>;

  return (
    <div className="container">
      <button 
        onClick={handleBack} 
        className="btn btn-outline"
        style={{ marginBottom: "var(--space-md)" }}
      >
        ← Back to Gallery
      </button>
      
      <div className="card" style={{ padding: "var(--space-md)" }}>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
          {photo.url && (
            <img 
              src={photo.url} 
              alt={photo.title} 
              className="photo-detail-img"
              style={{ 
                width: "100%", 
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)"
              }}
            />
          )}
          <div className="photo-info">
            <h2>{photo.title}</h2>
            <p className="text-muted">{photo.description || "No description available"}</p>
            <p className="text-muted">Photographer: {photo.userId || "Unknown"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;