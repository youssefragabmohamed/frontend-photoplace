import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faCamera } from '@fortawesome/free-solid-svg-icons';
import Notification from "./Notification";
import Photobox from "./Photobox";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const ProfilePage = ({ user }) => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(null);
  const [showPortfolio, setShowPortfolio] = useState(false);

  // Editable state variables
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      try {
        const userRes = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!userRes.ok) throw new Error('Failed to fetch profile');
        const userData = await userRes.json();
        setProfileUser(userData.user);
        setIsCurrentUser(user && user._id === userId);

        const photosRes = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!photosRes.ok) throw new Error('Failed to fetch photos');
        const userPhotos = await photosRes.json();
        setPhotos(userPhotos);
      } catch (error) {
        console.error("Profile fetch error:", error);
        setNotif({
          message: "Failed to load profile data",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, user]);

  const handleFollowToggle = async () => {
    if (isCurrentUser) return;

    const token = localStorage.getItem('authToken');
    const isFollowing = profileUser.isFollowing;

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/${isFollowing ? 'unfollow' : 'follow'}/${profileUser._id}`,
        {
          method: isFollowing ? 'DELETE' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!res.ok) throw new Error('Follow/unfollow failed');
      const updatedUser = await res.json();
      setProfileUser(updatedUser);

      setNotif({
        message: `${isFollowing ? 'Unfollowed' : 'Followed'} @${profileUser.username}`,
        type: "success"
      });
    } catch (error) {
      console.error("Follow/unfollow error:", error);
      setNotif({
        message: `Failed to ${profileUser.isFollowing ? 'unfollow' : 'follow'}. Try again.`,
        type: "error"
      });
    }
  };

  const handleDeletePhoto = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo._id !== photoId));
  };

  const handleProfilePicChange = (e) => {
    setNewProfilePic(e.target.files[0]);
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();

    // Add new profile picture if there's one
    if (newProfilePic) {
      formData.append('profilePic', newProfilePic);
    }

    // Add new description and link if provided
    if (newDescription) {
      formData.append('bio', newDescription);
    }
    if (newLink) {
      formData.append('link', newLink);
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/update/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to update profile');
      const updatedUser = await res.json();
      setProfileUser(updatedUser);
      setNotif({
        message: "Profile updated successfully",
        type: "success"
      });
    } catch (error) {
      setNotif({
        message: "Error updating profile. Try again.",
        type: "error"
      });
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="placeholder-content">
          <div className="placeholder-line" style={{ height: "80px", width: "80px", borderRadius: "50%" }}></div>
          <div className="placeholder-line short"></div>
          <div className="placeholder-line medium"></div>
          <div className="placeholder-line long"></div>
          <div className="placeholder-line" style={{ height: "40px", marginTop: "var(--space-lg)" }}></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return <div className="container">User not found</div>;
  }

  return (
    <div className="container">
      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      <div className="profile-header" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="flex" style={{ gap: "var(--space-xl)", alignItems: "flex-start" }}>
          <div className="avatar-container" style={{ position: "relative" }}>
            <img
              src={profileUser.profilePic || '/default-profile.jpg'}
              alt={profileUser.username}
              className="avatar"
              style={{ width: "100px", height: "100px", cursor: 'pointer' }}
              onClick={() => document.getElementById("fileInput").click()}
            />
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfilePicChange}
            />
            {isCurrentUser && (
              <div className="change-photo-icon" style={{ position: "absolute", bottom: "10px", right: "10px" }}>
                <FontAwesomeIcon icon={faCamera} style={{ color: 'white', fontSize: '20px' }} />
              </div>
            )}
          </div>

          <div className="profile-stats" style={{ flex: 1 }}>
            <div className="flex" style={{ alignItems: "center", gap: "var(--space-lg)", marginBottom: "var(--space-md)" }}>
              <h2 style={{ fontSize: "var(--text-xl)", margin: 0 }}>{profileUser.username}</h2>
              {!isCurrentUser && (
                <button
                  className={`btn ${profileUser.isFollowing ? 'btn-outline' : 'btn-primary'}`}
                  onClick={handleFollowToggle}
                  style={{ padding: "var(--space-xs) var(--space-md)" }}
                >
                  {profileUser.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
              {isCurrentUser && (
                <button className="btn btn-outline" style={{ padding: "6px" }}>
                  <FontAwesomeIcon icon={faEllipsis} />
                </button>
              )}
            </div>

            <div>
              {isEditingDescription ? (
                <div>
                  <textarea
                    value={newDescription || profileUser.bio || ''}
                    onChange={(e) => setNewDescription(e.target.value)}
                    style={{ width: "100%", height: "100px", marginBottom: "var(--space-md)" }}
                  />
                </div>
              ) : (
                <p className="text-muted">{profileUser.bio || "No bio yet"}</p>
              )}

              <div style={{ marginBottom: "var(--space-md)" }}>
                {isEditingDescription && (
                  <button className="btn btn-primary" onClick={handleSaveChanges}>
                    Save Changes
                  </button>
                )}
                {!isEditingDescription && (
                  <button className="btn btn-outline" onClick={() => setIsEditingDescription(true)}>
                    Edit Description
                  </button>
                )}
              </div>
            </div>

            <div>
              {profileUser.link && (
                <p>
                  <strong>Link:</strong> <a href={profileUser.link} target="_blank" rel="noopener noreferrer">{profileUser.link}</a>
                </p>
              )}

              {isEditingDescription && (
                <input
                  type="text"
                  value={newLink || profileUser.link || ''}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="Add a link"
                  style={{ width: "100%", marginBottom: "var(--space-md)" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs" style={{ borderBottom: "1px solid var(--glass-border)", marginBottom: "var(--space-lg)" }}>
        <div className="flex" style={{ justifyContent: "center", gap: "var(--space-xl)" }}>
          <button
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
            style={{
              padding: "var(--space-sm) 0",
              position: "relative",
              background: "none",
              border: "none",
              color: activeTab === 'posts' ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: activeTab === 'posts' ? "600" : "400"
            }}
          >
            Posts
            {activeTab === 'posts' && (
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "var(--primary)"
              }}></div>
            )}
          </button>
        </div>
      </div>

      <div className="portfolio-section" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: '600' }}>Portfolio</h3>
        <p>{profileUser.portfolioDescription || "No description available."}</p>

        {showPortfolio ? (
          <div className="portfolio-gallery">
            <Swiper
              spaceBetween={10}
              slidesPerView={3}
              loop={true}
              className="mySwiper"
            >
              {profileUser.portfolio && profileUser.portfolio.map((image, index) => (
                <SwiperSlide key={index}>
                  <img src={image.url} alt={image.title} style={{ width: '100%', borderRadius: '8px' }} />
                  <h4>{image.title}</h4>
                  <p>{image.description}</p>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <button
            onClick={() => setShowPortfolio(true)}
            style={{
              padding: "var(--space-sm) var(--space-lg)",
              background: "var(--primary)",
              color: "white",
              borderRadius: "8px",
              marginTop: 'var(--space-md)'
            }}
          >
            Show More
          </button>
        )}
      </div>

      {activeTab === 'posts' && (
        <Photobox photos={photos} loading={loading} onDeletePhoto={handleDeletePhoto} />
      )}
    </div>
  );
};

export default ProfilePage;
