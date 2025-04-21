import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faBookmark, faHeart, faComment } from '@fortawesome/free-solid-svg-icons';
import UploadPhoto from "./UploadPhoto";
import Notification from "./Notification"; // Import Notification Component
import Photobox from "./Photobox"; // Import Photobox component

const ProfilePage = ({ user }) => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [notif, setNotif] = useState(null); // Notification state

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

        const photosRes = await fetch(`${process.env.REACT_APP_API_URL}/api/photos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!photosRes.ok) throw new Error('Failed to fetch photos');
        const allPhotos = await photosRes.json();
        const userPhotos = allPhotos.filter(photo => photo.userId?._id === userId);
        setPhotos(userPhotos);
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, user]);

  const handleUploadSuccess = (newPhoto) => {
    setPhotos(prev => [newPhoto, ...prev]);
    setProfileUser(prev => ({
      ...prev,
      photosCount: (prev.photosCount || 0) + 1
    }));
    setShowUploadModal(false);
  };

  const handleFollowToggle = async () => {
    if (isCurrentUser) return;

    const token = localStorage.getItem('authToken');
    const isFollowing = profileUser.isFollowing; // assuming backend returns this field

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/follow/${profileUser._id}`,
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
    const newPhotos = photos.filter(photo => photo._id !== photoId);
    setPhotos(newPhotos);
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
      {/* Notification */}
      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      {/* Profile Header */}
      <div className="profile-header" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="flex" style={{ gap: "var(--space-xl)", alignItems: "flex-start" }}>
          <div className="avatar-container" style={{ position: "relative" }}>
            <img
              src={profileUser.profilePic || '/default-profile.jpg'}
              alt={profileUser.username}
              className="avatar"
              style={{ width: "100px", height: "100px" }}
            />
          </div>

          <div className="profile-stats" style={{ flex: 1 }}>
            <div className="flex" style={{ alignItems: "center", gap: "var(--space-lg)", marginBottom: "var(--space-md)" }}>
              <h2 style={{ fontSize: "var(--text-xl)", margin: 0 }}>{profileUser.username}</h2>
              {isCurrentUser ? (
                <>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowUploadModal(true)}
                    style={{ padding: "var(--space-xs) var(--space-md)" }}
                  >
                    Upload Photo
                  </button>
                  <button className="btn btn-outline" style={{ padding: "6px" }}>
                    <FontAwesomeIcon icon={faEllipsis} />
                  </button>
                </>
              ) : (
                <button
                  className={`btn ${profileUser.isFollowing ? 'btn-outline' : 'btn-primary'}`}
                  onClick={handleFollowToggle}
                  style={{ padding: "var(--space-xs) var(--space-md)" }}
                >
                  {profileUser.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>

            <div className="flex" style={{ gap: "var(--space-xl)", marginBottom: "var(--space-md)" }}>
              <div className="text-center">
                <strong>{profileUser.photosCount || 0}</strong>
                <p className="text-muted">Posts</p>
              </div>
              <div className="text-center">
                <strong>{profileUser.followersCount || 0}</strong>
                <p className="text-muted">Followers</p>
              </div>
              <div className="text-center">
                <strong>{profileUser.followingCount || 0}</strong>
                <p className="text-muted">Following</p>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-xs)" }}>
                {profileUser.fullName || profileUser.username}
              </h3>
              <p className="text-muted">{profileUser.bio || "No bio yet"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
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

      {/* Show Photos when 'posts' Tab is active */}
      {activeTab === 'posts' && (
        <Photobox photos={photos} loading={loading} onDeletePhoto={handleDeletePhoto} />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div className="card" style={{
            width: "100%",
            maxWidth: "500px",
            padding: "var(--space-lg)"
          }}>
            <UploadPhoto
              onUpload={handleUploadSuccess}
              onClose={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
