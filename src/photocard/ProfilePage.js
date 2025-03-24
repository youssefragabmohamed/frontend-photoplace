import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchUserProfile(userId);
    fetchUserPhotos(userId);
  }, [navigate]);

  const fetchUserProfile = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/profile`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data?._id) throw new Error("Invalid user data");
      setUser(data);
    } catch (error) {
      console.error("Profile fetch error:", error);
      setError(error.message);
      if (error.message.includes("401")) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPhotos = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/photos?userId=${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch photos");
      const data = await response.json();
      setPhotos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Photos fetch error:", error);
      setError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  if (loading) return <div className="profile-container">Loading...</div>;
  if (error) return <div className="profile-container">Error: {error}</div>;

  return (
    <div className="profile-container">
      {user && (
        <>
          <h2>{user.username}'s Profile</h2>
          <p>Email: {user.email}</p>
          <button onClick={handleLogout} className="logout-btn">
            Log Out
          </button>
          <div className="user-photos">
            {photos.length > 0 ? (
              photos.map((photo) => (
                <div key={photo._id} className="photo-card">
                  <img src={photo.url} alt={photo.title} />
                  <p>{photo.title}</p>
                </div>
              ))
            ) : (
              <p>No photos uploaded yet</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;