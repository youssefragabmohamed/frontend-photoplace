import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PhotoDetail = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`http://192.168.1.109:5000/photo/${id}`);
        if (!response.ok) {
          throw new Error("Photo not found");
        }
        const data = await response.json();
        setPhoto(data);
      } catch (err) {
        console.error("Error fetching photo:", err);
        setError("Photo not found");
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!photo) return <div>Photo not found!</div>;

  const imageUrl = photo.url?.startsWith("http")
    ? photo.url
    : `http://192.168.1.109:5000${photo.url}`;

  return (
    <div className="photo-detail">
      <button onClick={handleBack} className="back-button">
        Back to Gallery
      </button>
      <div className="photo-detail-container">
        {photo.url ? (
          <img src={imageUrl} alt={photo.title} className="photo-detail-img" />
        ) : (
          <p>No image available</p>
        )}
        <div className="photo-info">
          <h2>{photo.title}</h2>
          <p>{photo.description || "No description available"}</p>
          <p>Photographer: {photo.photographer || "Unknown"}</p>
          <p>Price: ${photo.price || "Not available"}</p>
          <button className="purchase-button">Buy Now</button>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;