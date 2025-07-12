import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUserEdit, faLink, faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Photobox from "./Photobox";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '../App.css'; // New CSS file

// Loading animation as data URL for consistent loading state
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

const ProfilePage = ({ user: currentUser }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('photos');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  const [zoom, setZoom] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const observer = useRef();
  const lastPhotoElementRef = useRef(null);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return LOADING_ANIMATION;
    if (url.startsWith('http')) return url;
    
    // Ensure we have a valid API URL
    const apiUrl = process.env.REACT_APP_API_URL || '';
    if (!apiUrl) {
      console.warn('REACT_APP_API_URL is not defined');
      return url; // Return the original URL as fallback
    }
    
    return `${apiUrl}${url}`;
  };

  // Intersection Observer callback
  const lastPhotoRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    setPhotos([]);
    setPage(1);
    setHasMore(true);
    fetchUserData(1, true);
  }, [userId, activeTab]);

  useEffect(() => {
    if (page > 1) {
      fetchUserData(page, false);
    }
  }, [page]);

  const fetchUserData = async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      // Fetch user profile only on first page or reset
      if (pageNum === 1 || reset) {
        const profileResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (!profileResponse.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileResponse.json();
        setProfileUser(profileData.user);
      }

      // Fetch photos with pagination
      let endpoint = `/api/photos/user/${userId}?page=${pageNum}&limit=12`;
      if (activeTab === 'saved') {
        endpoint = `/api/photos/saved?page=${pageNum}&limit=12`;
      }

      const photosResponse = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!photosResponse.ok) throw new Error('Failed to fetch photos');
      const photosData = await photosResponse.json();

      if (activeTab === 'saved') {
        setSavedPhotos(prev => reset ? photosData.photos : [...prev, ...photosData.photos]);
        setPhotos(prev => reset ? photosData.photos : [...prev, ...photosData.photos]);
      } else {
        setPhotos(prev => reset ? photosData.photos : [...prev, ...photosData.photos]);
      }

      setHasMore(photosData.hasMore);

      // If viewing own profile and on first page, fetch saved photos
      if (currentUser?._id === userId && (pageNum === 1 || reset)) {
        const savedResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/saved`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          setSavedPhotos(savedData.photos || []);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (pageNum === 1) setLoading(false);
      else setLoadingMore(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    imgRef.current = e.target;
    const { width, height } = e.target;
    const cropWidth = Math.min(width, height);
    const x = (width - cropWidth) / 2;
    const y = (height - cropWidth) / 2;

    setCrop({
      unit: 'px',
      width: cropWidth,
      height: cropWidth,
      x,
      y,
      aspect: 1
    });
  };

  const getCroppedImg = async (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        1
      );
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !crop.width || !crop.height) return;

    try {
      setUploadLoading(true);
      const croppedBlob = await getCroppedImg(imgRef.current, crop);
      const formData = new FormData();
      formData.append('profilePic', new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' }));

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/update-pic`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile picture');
      }

      const data = await response.json();
      setProfileUser(prev => ({ ...prev, profilePic: data.profilePic }));
      setShowCropModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
    } catch (err) {
      console.error('Profile pic update error:', err);
      setError(err.message || 'Failed to update profile picture');
    } finally {
      setUploadLoading(false);
    }
  };

  const handlePhotoClick = (photoId) => {
    navigate(`/photos/${photoId}`);
  };

  const handleSavePhoto = async (photoId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/save/${photoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to save photo');

      const data = await response.json();
      setSavedPhotos(prev => [...prev, data]);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="profile-container loading-state">
        <img src={LOADING_ANIMATION} alt="Loading..." className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container error-state">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-container error-state">
        <div className="error-message">
          User not found
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userId;

  return (
    <motion.div 
      className="profile-container"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {error && (
        <motion.div 
          className={`notification error`}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          onAnimationComplete={() => {
            setTimeout(() => setError(null), 3000);
          }}
        >
          {error}
        </motion.div>
      )}

      <div className="profile-header">
        <motion.div 
          className="avatar-container"
          whileHover={{ scale: 1.03 }}
          variants={slideUp}
          style={{
            position: 'relative',
            cursor: isOwnProfile ? 'pointer' : 'default'
          }}
          onMouseEnter={() => isOwnProfile && setIsHovering(true)}
          onMouseLeave={() => isOwnProfile && setIsHovering(false)}
          onClick={() => isOwnProfile && fileInputRef.current?.click()}
        >
          {(imageLoading || uploadLoading) && (
            <div className="loading-overlay">
              <img src={LOADING_ANIMATION} alt="Loading..." className="loading-spinner" />
            </div>
          )}
          
          <img
            src={getImageUrl(profileUser.profilePic)}
            alt={profileUser.username}
            className="avatar"
            style={{
              opacity: (imageLoading || uploadLoading) ? 0.5 : 1,
              filter: isHovering ? 'brightness(0.7)' : 'none'
            }}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              setImageLoading(false);
              e.target.src = LOADING_ANIMATION;
            }}
          />
          
          {isOwnProfile && isHovering && !uploadLoading && (
            <div className="avatar-overlay">
              <FontAwesomeIcon icon={faCamera} size="lg" />
              <span className="upload-text">{profileUser.profilePic ? 'Change Photo' : 'Add Photo'}</span>
            </div>
          )}
          
          {isOwnProfile && (
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileSelect}
            />
          )}
        </motion.div>

        <div className="profile-info">
          <motion.h2 variants={slideUp}>{profileUser.username}</motion.h2>
          
          <motion.div className="stats" variants={slideUp}>
            <div><strong>{photos.length}</strong> posts</div>
            <div><strong>{profileUser.followers?.length || 0}</strong> followers</div>
            <div><strong>{profileUser.following?.length || 0}</strong> following</div>
          </motion.div>

          <motion.div className="bio" variants={slideUp}>
            <p>{profileUser.bio || "No bio yet"}</p>
            {profileUser.link && (
              <a 
                href={profileUser.link}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-link"
              >
                <FontAwesomeIcon icon={faLink} /> {profileUser.link}
              </a>
            )}
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('photos');
            setPhotos([]);
            setPage(1);
            setHasMore(true);
          }}
        >
          Posts
        </button>
        {isOwnProfile && (
          <button
            className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('saved');
              setPhotos([]);
              setPage(1);
              setHasMore(true);
            }}
          >
            Saved
          </button>
        )}
      </div>

      {/* Photo Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Photobox 
            photos={activeTab === 'photos' ? photos : savedPhotos}
            loading={loading}
            onPhotoClick={handlePhotoClick}
            onSavePhoto={handleSavePhoto}
            showSaveButton={true}
            savedPhotos={savedPhotos.map(photo => photo._id)}
            selectedTab={activeTab}
            refreshPhotos={() => fetchUserData(1, true)}
            lastPhotoRef={lastPhotoRef}
            loadingMore={loadingMore}
          />
        </motion.div>
      </AnimatePresence>

      {showCropModal && (
        <div className="crop-modal">
          <div className="crop-container">
            <div className="crop-header">
              <h3>Edit Photo</h3>
              <button 
                className="close-button"
                onClick={() => {
                  setShowCropModal(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="crop-preview">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={1}
                circularCrop
                className="circular-crop"
              >
                <img
                  ref={imgRef}
                  src={previewUrl}
                  onLoad={onImageLoad}
                  style={{ 
                    maxHeight: '70vh',
                    transform: `scale(${zoom})`
                  }}
                />
              </ReactCrop>
            </div>

            <div className="crop-controls">
              <div className="zoom-control">
                <label>Zoom</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="crop-actions">
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setShowCropModal(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleCropComplete}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfilePage;