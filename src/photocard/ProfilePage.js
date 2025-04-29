import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faCamera, faUserEdit, faLink, faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import Notification from "./Notification";
import Photobox from "./Photobox";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const ProfilePage = ({ user }) => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(null);
  const [showPortfolio, setShowPortfolio] = useState(false);

  // Editable state variables
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDesc, setPortfolioDesc] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      try {
        // Fetch user profile
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
        setPortfolioTitle(userData.user.portfolioTitle || 'My Portfolio');
        setPortfolioDesc(userData.user.portfolioDescription || '');

        // Fetch user's posts
        const photosRes = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!photosRes.ok) {
          // Handle empty state gracefully
          setPhotos([]);
          throw new Error(photosRes.status === 404 ? 'No photos found' : 'Failed to fetch photos');
        }
        const userPhotos = await photosRes.json();
        setPhotos(userPhotos || []);

        // Fetch saved photos if it's the current user
        if (user && user._id === userId) {
          const savedRes = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/saved`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          if (!savedRes.ok) throw new Error('Failed to fetch saved photos');
          const savedData = await savedRes.json();
          setSavedPhotos(savedData);
        }
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
    setSavedPhotos(prev => prev.filter(photo => photo._id !== photoId));
  };

  const handleSavePhoto = async (photoId) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/save/${photoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to save photo');
      const data = await res.json();

      // Update saved photos list
      if (isCurrentUser) {
        const savedRes = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/saved`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        const savedData = await savedRes.json();
        setSavedPhotos(savedData);
      }

      return data.isSaved;
    } catch (error) {
      console.error("Save photo error:", error);
      setNotif({
        message: "Failed to save photo",
        type: "error"
      });
      throw error;
    }
  };

  const handleProfilePicChange = (e) => {
    setNewProfilePic(e.target.files[0]);
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();

    if (newProfilePic) {
      formData.append('profilePic', newProfilePic);
    }
    if (newDescription) {
      formData.append('bio', newDescription);
    }
    if (newLink) {
      formData.append('link', newLink);
    }
    if (portfolioTitle) {
      formData.append('portfolioTitle', portfolioTitle);
    }
    if (portfolioDesc) {
      formData.append('portfolioDescription', portfolioDesc);
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
      setIsEditing(false);
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

  const handleAddToPortfolio = async (photoId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/portfolio/${photoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to add to portfolio');
      const updatedUser = await res.json();
      setProfileUser(updatedUser);
      setNotif({ message: "Added to portfolio!", type: "success" });
    } catch (error) {
      setNotif({ message: error.message, type: "error" });
    }
  };

  const handleRemoveFromPortfolio = async (photoId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/portfolio/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to remove from portfolio');
      const updatedUser = await res.json();
      setProfileUser(updatedUser);
      setNotif({ message: "Removed from portfolio", type: "success" });
    } catch (error) {
      setNotif({ message: error.message, type: "error" });
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
    <div className="container" style={{ 
      maxWidth: '935px', 
      margin: '0 auto',
      padding: '0 15px', // Add padding for mobile
      boxSizing: 'border-box' // Ensure padding is included in width
    }}>
      {notif && <Notification message={notif.message} type={notif.type} onClose={() => setNotif(null)} />}

      {/* Updated Profile Header */}
      <div className="profile-header" style={{ 
        padding: '20px 0',
        overflow: 'hidden' // Prevent overflow
      }}>
        <div className="flex" style={{ 
          flexDirection: window.innerWidth < 768 ? 'column' : 'row', // Stack on mobile
          gap: "20px", // Reduced gap for mobile
          alignItems: "flex-start"
        }}>
          <div className="avatar-container" style={{ 
            position: "relative", 
            flex: '0 0 auto',
            alignSelf: 'center' // Center on mobile
          }}>
            <img
              src={profileUser.profilePic || '/default-profile.jpg'}
              alt={profileUser.username}
              className="avatar"
              style={{ 
                width: "150px", 
                height: "150px", 
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #fafafa'
              }}
              onClick={() => isCurrentUser && document.getElementById("fileInput").click()}
            />
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfilePicChange}
            />
            {isCurrentUser && (
              <div 
                className="change-photo-icon" 
                style={{ 
                  position: "absolute", 
                  bottom: "10px", 
                  right: "10px",
                  background: 'rgba(0,0,0,0.5)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <FontAwesomeIcon icon={faCamera} style={{ color: 'white', fontSize: '16px' }} />
              </div>
            )}
          </div>

          <div className="profile-info" style={{ 
            flex: 1,
            width: '100%', // Full width on mobile
            overflow: 'hidden' // Prevent text overflow
          }}>
            <div className="flex" style={{ alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "28px", margin: 0, fontWeight: '300' }}>{profileUser.username}</h2>
              
              {isCurrentUser ? (
                <>
                  <button
                    className="btn btn-outline"
                    style={{ 
                      padding: "5px 9px",
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    Edit Profile
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ 
                      padding: "5px 9px",
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}
                  >
                    View Archive
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`btn ${profileUser.isFollowing ? 'btn-outline' : 'btn-primary'}`}
                    onClick={handleFollowToggle}
                    style={{ 
                      padding: "5px 9px",
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}
                  >
                    {profileUser.isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="btn btn-outline" style={{ padding: "5px 9px" }}>
                    Message
                  </button>
                </>
              )}
            </div>

            <div className="profile-stats" style={{ 
              display: 'flex', 
              gap: window.innerWidth < 768 ? '20px' : '40px', // Smaller gap on mobile
              marginBottom: '20px',
              justifyContent: window.innerWidth < 768 ? 'space-around' : 'flex-start' // Better spacing on mobile
            }}>
              <div><strong>{photos.length}</strong> posts</div>
              <div><strong>{profileUser.followers || 0}</strong> followers</div>
              <div><strong>{profileUser.following || 0}</strong> following</div>
            </div>

            <div className="profile-bio" style={{ 
              marginBottom: '20px',
              wordBreak: 'break-word' // Prevent text overflow
            }}>
              {isEditing ? (
                <textarea
                  value={newDescription || profileUser.bio || ''}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Write a bio..."
                  style={{ 
                    width: "100%", 
                    minHeight: "80px", 
                    padding: '8px',
                    border: '1px solid #dbdbdb',
                    borderRadius: '3px',
                    resize: 'vertical',
                    marginBottom: '10px'
                  }}
                />
              ) : (
                <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{profileUser.bio || "No bio yet"}</p>
              )}
              
              {profileUser.link && (
                <div style={{ marginTop: '10px' }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={newLink || profileUser.link || ''}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="Add a link"
                      style={{ 
                        width: "100%", 
                        padding: '8px',
                        border: '1px solid #dbdbdb',
                        borderRadius: '3px'
                      }}
                    />
                  ) : (
                    <a 
                      href={profileUser.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#00376b', fontWeight: '600' }}
                    >
                      <FontAwesomeIcon icon={faLink} style={{ marginRight: '6px' }} />
                      {profileUser.link.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit section remains the same */}
      {isEditing && (
        <div className="edit-section" style={{ 
          padding: '20px 0',
          borderTop: '1px solid #dbdbdb',
          borderBottom: '1px solid #dbdbdb',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Portfolio Settings</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Portfolio Title</label>
            <input
              type="text"
              value={portfolioTitle}
              onChange={(e) => setPortfolioTitle(e.target.value)}
              style={{ 
                width: "100%", 
                padding: '8px',
                border: '1px solid #dbdbdb',
                borderRadius: '3px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Portfolio Description</label>
            <textarea
              value={portfolioDesc}
              onChange={(e) => setPortfolioDesc(e.target.value)}
              style={{ 
                width: "100%", 
                minHeight: "100px", 
                padding: '8px',
                border: '1px solid #dbdbdb',
                borderRadius: '3px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div className="flex" style={{ justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => setIsEditing(false)}
              style={{ padding: '5px 9px' }}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSaveChanges}
              style={{ padding: '5px 9px' }}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Portfolio section remains the same */}
      <div className="portfolio-section" style={{ 
        padding: '20px 0',
        borderTop: '1px solid #dbdbdb',
        borderBottom: '1px solid #dbdbdb',
        marginBottom: '30px'
      }}>
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: '600',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {portfolioTitle}
          {isCurrentUser && !isEditing && (
            <FontAwesomeIcon 
              icon={faUserEdit} 
              style={{ color: '#8e8e8e', cursor: 'pointer' }} 
              onClick={() => setIsEditing(true)}
            />
          )}
        </h3>
        
        {!showPortfolio && (
          <p style={{ 
            fontSize: '14px', 
            color: '#262626',
            lineHeight: '1.5',
            marginBottom: '15px',
            whiteSpace: 'pre-line',
            maxHeight: '60px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {portfolioDesc || "No description available."}
          </p>
        )}
        
        {showPortfolio && (
          <>
            <p style={{ 
              fontSize: '14px', 
              color: '#262626',
              lineHeight: '1.5',
              marginBottom: '15px',
              whiteSpace: 'pre-line'
            }}>
              {portfolioDesc || "No description available."}
            </p>
            
            <div className="portfolio-gallery" style={{ margin: '20px 0' }}>
              <Swiper
                spaceBetween={16}
                slidesPerView={3}
                loop={true}
                className="mySwiper"
              >
                {profileUser.portfolio && profileUser.portfolio.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div style={{ paddingBottom: '100%', position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
                      <img 
                        src={image.url} 
                        alt={image.title} 
                        style={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }} 
                      />
                    </div>
                    <h4 style={{ fontSize: '14px', margin: '8px 0 4px' }}>{image.title}</h4>
                    <p style={{ fontSize: '12px', color: '#8e8e8e' }}>{image.description}</p>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </>
        )}
        
        {portfolioDesc && portfolioDesc.length > 100 && !showPortfolio && (
          <button
            onClick={() => setShowPortfolio(true)}
            style={{
              padding: 0,
              background: 'none',
              border: 'none',
              color: '#8e8e8e',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Show more
          </button>
        )}
      </div>

      {/* Updated tabs section with Saved tab */}
      <div className="profile-tabs" style={{ 
        borderBottom: "1px solid var(--glass-border)", 
        marginBottom: "30px" 
      }}>
        <div className="flex" style={{ justifyContent: "center", gap: "60px" }}>
          <button
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
            style={{
              padding: "16px 0",
              position: "relative",
              background: "none",
              border: "none",
              color: activeTab === 'posts' ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: activeTab === 'posts' ? "600" : "400",
              textTransform: 'uppercase',
              fontSize: '12px',
              letterSpacing: '1px'
            }}
          >
            Posts
            {activeTab === 'posts' && (
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "1px",
                background: "#262626"
              }}></div>
            )}
          </button>
          {isCurrentUser && (
            <button
              className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
              style={{
                padding: "16px 0",
                position: "relative",
                background: "none",
                border: "none",
                color: activeTab === 'saved' ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: activeTab === 'saved' ? "600" : "400",
                textTransform: 'uppercase',
                fontSize: '12px',
                letterSpacing: '1px'
              }}
            >
              Saved
              {activeTab === 'saved' && (
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: "#262626"
                }}></div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'posts' && (
        <Photobox 
          photos={photos} 
          loading={loading} 
          onDeletePhoto={handleDeletePhoto} 
          onSavePhoto={handleSavePhoto}
          showSaveButton={true}
        />
      )}
      {activeTab === 'saved' && isCurrentUser && (
        <Photobox 
          photos={savedPhotos} 
          loading={loading} 
          onDeletePhoto={handleDeletePhoto} 
          onSavePhoto={handleSavePhoto}
          showSaveButton={true}
        />
      )}
    </div>
  );
};

export default ProfilePage;