import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserProfile(userId);
      fetchUserPhotos(userId);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/profile`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchUserPhotos = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos?userId=${userId}`);
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching user photos:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="profile-container">
      {user ? (
        <>
          <h2>{user.username}'s Profile</h2>
          <p>Email: {user.email}</p>
          <button onClick={handleLogout} className="logout-btn">Log Out</button>
          <div className="user-photos">
            {photos.length > 0 ? (
              photos.map((photo) => (
                <div key={photo._id} className="photo-card">
                  <img src={photo.url} alt={photo.title} />
                  <p>{photo.title}</p>
                </div>
              ))
            ) : (
              <p>No uploaded photos yet.</p>
            )}
          </div>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default ProfilePage;