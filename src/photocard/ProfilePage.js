import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUserEdit, faLink, faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Photobox from "./Photobox";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '../App.css'; // New CSS file
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dropzone from 'react-dropzone';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage'; // Utility to crop image from react-easy-crop docs
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';

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

const profileSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  bio: yup.string().max(160, 'Bio must be at most 160 characters'),
});

const fetchProfileUser = async (userId, token) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};
const fetchPhotos = async (userId, token) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/photos?userId=${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch photos');
  return res.json();
};
const fetchSavedPhotos = async (token) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/saved`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch saved photos');
  return res.json();
};

const ProfilePage = ({ user: currentUser }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const queryClient = useQueryClient();

  // Add all missing state/refs
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const observer = useRef(null);
  const [hasMore, setHasMore] = useState(true); // Fix crash: define hasMore state
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [profileUser, setProfileUser] = useState(null);
  const [savedPhotos, setSavedPhotos] = useState([]);

  // Profile user
  const { data: profileUserData, isLoading: loadingProfile, error: errorProfile } = useQuery({
    queryKey: ['profileUser', userId],
    queryFn: () => fetchProfileUser(userId, token),
    enabled: !!userId && !!token
  });

  // User's photos
  const { data: photosData, isLoading: loadingPhotos, error: errorPhotos } = useQuery({
    queryKey: ['photos', userId],
    queryFn: () => fetchPhotos(userId, token),
    enabled: !!userId && !!token
  });

  // Saved photos
  const { data: savedData, isLoading: loadingSaved, error: errorSaved } = useQuery({
    queryKey: ['savedPhotos', userId],
    queryFn: () => fetchSavedPhotos(token),
    enabled: !!userId && !!token
  });

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
    if (loadingProfile || loadingPhotos || loadingSaved) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingProfile, loadingPhotos, loadingSaved, hasMore]);

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

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      username: profileUser?.username || '',
      bio: profileUser?.bio || '',
    },
  });

  useEffect(() => {
    if (profileUser) {
      setValue('username', profileUser.username || '');
      setValue('bio', profileUser.bio || '');
    }
  }, [profileUser, setValue]);

  const onEdit = () => setEditing(true);
  const onCancel = () => {
    setEditing(false);
    setAvatarPreview(null);
  };

  const onAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setCropImage(URL.createObjectURL(acceptedFiles[0]));
      setShowCrop(true);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    const cropped = await getCroppedImg(cropImage, croppedAreaPixels);
    setAvatarPreview(cropped);
    setShowCrop(false);
  };

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${profileUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          profilePic: avatarPreview || profileUser.profilePic
        })
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      setProfileUser(updated);
      toast.success('Profile updated!');
      closeEditModal();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  // Fetch following state on mount
  useEffect(() => {
    if (!profileUser || !currentUser || profileUser._id === currentUser._id) return;
    const token = localStorage.getItem('authToken');
    fetch(`${process.env.REACT_APP_API_URL}/api/users/${profileUser._id}/followers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(followers => {
        setIsFollowing(followers.some(f => f._id === currentUser._id));
      });
  }, [profileUser, currentUser]);

  const handleFollow = async () => {
    setFollowLoading(true);
    const token = localStorage.getItem('authToken');
    const method = isFollowing ? 'DELETE' : 'POST';
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${profileUser._id}/follow`, {
      method,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setIsFollowing(!isFollowing);
      // Optionally update followers count in UI
      if (!isFollowing) {
        setProfileUser(prev => ({ ...prev, followers: [...(prev.followers || []), { _id: currentUser._id }] }));
      } else {
        setProfileUser(prev => ({ ...prev, followers: (prev.followers || []).filter(f => f._id !== currentUser._id) }));
      }
    }
    setFollowLoading(false);
  };

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => {
    setShowEditModal(false);
    setAvatarPreview(null);
    setEditing(false);
  };

  // Helper function for robust image fallback
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/default-avatar.png';
  };

  if (errorProfile || errorPhotos || errorSaved) {
    return (
      <div className="profile-container error-state" style={{ padding: 40, textAlign: 'center' }}>
        <div className="error-message" style={{ color: 'red', fontSize: 18, marginBottom: 16 }}>
          Sorry, something went wrong loading this profile.<br />
          {errorProfile?.message || errorPhotos?.message || errorSaved?.message || 'Unknown error.'}
        </div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  if (loadingProfile || loadingPhotos || loadingSaved) {
    return (
      <div className="profile-page" style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Skeleton circle width={96} height={96} />
          <div style={{ flex: 1 }}>
            <Skeleton width={120} height={24} style={{ marginBottom: 8 }} />
            <Skeleton width={80} height={16} style={{ marginBottom: 8 }} />
            <Skeleton width={180} height={16} />
          </div>
        </div>
        <div style={{ marginTop: 32 }}>
          <Skeleton width={80} height={20} style={{ marginRight: 16 }} />
          <Skeleton width={80} height={20} />
        </div>
        <div style={{ marginTop: 32 }}>
          <Skeleton count={6} height={180} style={{ marginBottom: 12 }} />
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-container error-state" style={{ padding: 40, textAlign: 'center' }}>
        <div className="error-message" style={{ color: 'red', fontSize: 18, marginBottom: 16 }}>
          User not found or failed to load.
        </div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userId;

  return (
    <>
      <Helmet>
        <title>{profileUser?.username ? `${profileUser.username} • PhotoPlace` : 'Profile • PhotoPlace'}</title>
        <meta name="description" content={profileUser?.bio || 'View user profile on PhotoPlace.'} />
      </Helmet>
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
          {/* Follow/Unfollow button for other users */}
          {currentUser && profileUser && currentUser._id !== profileUser._id && (
            <button className="btn btn-primary" onClick={handleFollow} disabled={followLoading} style={{ float: 'right', marginBottom: 16 }}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
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
              onError={handleImageError}
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
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('posts');
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
              photos={activeTab === 'posts' ? photos : savedPhotos}
              loading={loading}
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

        <Dialog open={showEditModal} onClose={closeEditModal} className="edit-profile-modal">
          <div className="modal-backdrop" aria-hidden="true" />
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, margin: '80px auto', boxShadow: '0 4px 32px rgba(0,0,0,0.12)' }}
          >
            <Dialog.Title style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Edit Profile</Dialog.Title>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                <Dropzone onDrop={onDrop} accept={{ 'image/*': [] }} multiple={false}>
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} style={{ border: '2px dashed #ccc', borderRadius: 12, padding: 16, textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}>
                      <input {...getInputProps()} />
                      <img src={avatarPreview || profileUser?.profilePic || '/default-avatar.png'} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee', marginBottom: 8 }} />
                      <div style={{ color: '#888', fontSize: 13 }}>Drag & drop or click to upload</div>
                    </div>
                  )}
                </Dropzone>
                {showCrop && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%' }}>
                      <Cropper
                        image={cropImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={handleCropSave}>Save</button>
                        <button className="btn btn-outline" onClick={() => setShowCrop(false)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <input
                {...register('username')}
                style={{ width: '100%', fontSize: 16, marginBottom: 12, padding: 8, border: errors.username ? '1px solid red' : '1px solid #ccc', borderRadius: 4 }}
                disabled={isSubmitting}
                placeholder="Username"
              />
              {errors.username && <div style={{ color: 'red', fontSize: 12 }}>{errors.username.message}</div>}
              <input
                {...register('name')}
                style={{ width: '100%', fontSize: 16, marginBottom: 12, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                disabled={isSubmitting}
                placeholder="Name"
              />
              <textarea
                {...register('bio')}
                style={{ width: '100%', fontSize: 14, marginBottom: 12, padding: 8, border: errors.bio ? '1px solid red' : '1px solid #ccc', borderRadius: 4, minHeight: 48 }}
                maxLength={160}
                disabled={isSubmitting}
                placeholder="Bio"
              />
              {errors.bio && <div style={{ color: 'red', fontSize: 12 }}>{errors.bio.message}</div>}
              <input
                {...register('website')}
                style={{ width: '100%', fontSize: 14, marginBottom: 12, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                disabled={isSubmitting}
                placeholder="Website"
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Save</button>
                <button type="button" className="btn btn-outline" onClick={closeEditModal} disabled={isSubmitting}>Cancel</button>
              </div>
            </form>
          </motion.div>
        </Dialog>
      </motion.div>
    </>
  );
};

export default ProfilePage;