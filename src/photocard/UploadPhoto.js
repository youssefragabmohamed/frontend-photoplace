import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

const UploadPhoto = ({ onUpload, onClose, refreshPhotos }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTab, setSelectedTab] = useState('digital');
  const [compressionStatus, setCompressionStatus] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    onProgress: (progress) => {
      setCompressionStatus(`Compressing: ${Math.round(progress)}%`);
    }
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setCompressionStatus('Starting compression...');
      const compressedFile = await imageCompression(selectedFile, options);
      setCompressionStatus('');
      
      setFile(compressedFile);
      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);
      setError('');

      // Log compression results
      console.log('Original file size:', selectedFile.size / 1024 / 1024, 'MB');
      console.log('Compressed file size:', compressedFile.size / 1024 / 1024, 'MB');
    } catch (err) {
      setError('Error compressing image: ' + err.message);
      setCompressionStatus('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile) return;

      if (!droppedFile.type.startsWith('image/')) {
        setError('Please drop an image file');
        return;
      }

      try {
        setCompressionStatus('Starting compression...');
        const compressedFile = await imageCompression(droppedFile, options);
        setCompressionStatus('');
        
        setFile(compressedFile);
        const previewUrl = URL.createObjectURL(compressedFile);
        setPreview(previewUrl);
        setError('');
      } catch (err) {
        setError('Error compressing image: ' + err.message);
        setCompressionStatus('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select an image file");
      return;
    }

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('photo', file);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('location', selectedTab.toLowerCase());

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error(data.message || 'Upload failed');
      }

      const data = await response.json();
      if (data.success || data.photo) {
        resetForm();
        if (onUpload) onUpload(data.photo);
        if (refreshPhotos) refreshPhotos();
        navigate('/');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h2>Upload Photo</h2>
        {onClose && (
          <button onClick={onClose} className="close-btn">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tab-selector-container">
        <div className="tab-selector">
          <label
            className={`tab-label ${selectedTab === 'digital' ? 'active' : ''}`}
            onClick={() => setSelectedTab('digital')}
          >
            <div className="tab-option">
              <span>Digital</span>
            </div>
          </label>
          <label
            className={`tab-label ${selectedTab === 'traditional' ? 'active' : ''}`}
            onClick={() => setSelectedTab('traditional')}
          >
            <div className="tab-option">
              <span>Traditional</span>
            </div>
          </label>
        </div>
        <div className="tab-description">
          {selectedTab === 'digital' ? (
            <p>Upload photos from your digital collection (e.g., phone, camera).</p>
          ) : (
            <p>Upload scanned or photographed images of your traditional artwork.</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {preview ? (
          <div className="preview-container">
            <img
              src={preview}
              alt="Preview"
              className="preview-image"
              style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="btn btn-outline"
            >
              Replace Image
            </button>
          </div>
        ) : (
          <div
            className={`dropzone ${isDragging ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <div className="dropzone-content">
              <FontAwesomeIcon icon={faCloudUploadAlt} size="3x" />
              <p>Drag & drop photos here</p>
              <p>or</p>
              <button
                type="button"
                className="browse-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current.click();
                }}
              >
                Browse files
              </button>
              {compressionStatus && (
                <p className="compression-status">{compressionStatus}</p>
              )}
            </div>
            <input
              type="file"
              name="photo"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Give your photo a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            placeholder="Tell us about this photo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary submit-btn"
          disabled={isUploading || !file || !title.trim()}
        >
          {isUploading ? (
            <>
              <span className="spinner" role="status" aria-hidden="true"></span>
              Uploading...
            </>
          ) : (
            "Upload Photo"
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadPhoto;