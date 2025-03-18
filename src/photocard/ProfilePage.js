import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchUserPhotos(JSON.parse(storedUser).email);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserPhotos = async (email) => {
    try {
      const response = await fetch(`http://192.168.1.109:5000/photos?user=${email}`);
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching user photos:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
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
              photos.map(photo => (
                <div key={photo._id} className="photo-card">
                  <img src={`http://192.168.1.109:5000${photo.url}`} alt={photo.title} />
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