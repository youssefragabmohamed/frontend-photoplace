import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import PhotoBox from '../photocard/Photobox';
import '../App.css';

const GalleryTabs = ({ user }) => {
  const [activeTab, setActiveTab] = useState('digital');
  const [photos, setPhotos] = useState([]);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();
  const lastPhotoElementRef = useRef(null);

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
    fetchPhotos(1, true);
  }, [activeTab]);

  const fetchPhotos = async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let endpoint = '/api/photos';
      if (activeTab === 'saved') {
        endpoint = '/api/photos/saved';
      } else if (activeTab === 'digital' || activeTab === 'traditional') {
        endpoint = `/api/photos?location=${activeTab.toLowerCase()}`;
      }

      // Add pagination parameters
      endpoint += `${endpoint.includes('?') ? '&' : '?'}page=${pageNum}&limit=12`;

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch photos');
      }

      const data = await response.json();
      
      if (activeTab === 'saved') {
        setSavedPhotos(data.photos);
        setPhotos(prev => reset ? data.photos : [...prev, ...data.photos]);
      } else {
        const filteredPhotos = data.photos.filter(photo => 
          photo.location === activeTab.toLowerCase()
        );
        setPhotos(prev => reset ? filteredPhotos : [...prev, ...filteredPhotos]);
      }

      setHasMore(data.hasMore);

      // Fetch saved photos IDs for the save button state
      const savedResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/saved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        setSavedPhotos(savedData.photos || []);
      }
    } catch (err) {
      console.error('Fetch photos error:', err);
      setError(err.message || 'Failed to load photos');
    } finally {
      if (pageNum === 1) setLoading(false);
      else setLoadingMore(false);
    }
  };

  const handleSavePhoto = async (photoId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/save/${photoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to save photo');
      const data = await response.json();

      if (data.isSaved) {
        setSavedPhotos(prev => [...prev, { _id: photoId }]);
      } else {
        setSavedPhotos(prev => prev.filter(photo => photo._id !== photoId));
        if (activeTab === 'saved') {
          setPhotos(prev => prev.filter(photo => photo._id !== photoId));
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete photo');
      setPhotos(prev => prev.filter(photo => photo._id !== photoId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="gallery-container">
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'digital' ? 'active' : ''}`}
            onClick={() => setActiveTab('digital')}
          >
            Digital Gallery
          </button>
          <button
            className={`tab-button ${activeTab === 'traditional' ? 'active' : ''}`}
            onClick={() => setActiveTab('traditional')}
          >
            Traditional Gallery
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <PhotoBox
        photos={photos}
        loading={loading}
        lastPhotoRef={lastPhotoRef}
        loadingMore={loadingMore}
      />
    </div>
  );
};

export default GalleryTabs; 