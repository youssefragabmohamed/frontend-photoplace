import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PhotoBox from '../photocard/Photobox';
import '../App.css';

const GalleryTabs = ({ user }) => {
  const [activeTab, setActiveTab] = useState('digital');
  const [photos, setPhotos] = useState([]);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, [activeTab]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/photos';
      if (activeTab === 'saved') {
        endpoint = '/api/photos/saved';
      } else if (activeTab === 'digital' || activeTab === 'traditional') {
        endpoint = `/api/photos?location=${activeTab}`;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      
      if (activeTab === 'saved') {
        setSavedPhotos(data);
        setPhotos(data);
      } else {
        setPhotos(data);
      }

      // Fetch saved photos IDs for the save button state
      const savedResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/saved`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        setSavedPhotos(savedData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <button
            className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Photos
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
        onDeletePhoto={handleDeletePhoto}
        onSavePhoto={handleSavePhoto}
        showSaveButton={true}
        savedPhotos={savedPhotos.map(photo => photo._id)}
        selectedTab={activeTab}
        refreshPhotos={fetchPhotos}
      />
    </div>
  );
};

export default GalleryTabs; 