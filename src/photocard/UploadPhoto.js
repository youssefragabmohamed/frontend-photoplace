import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import '../App.css'; // Use App.css instead of UploadPhoto.css

const UploadPhoto = ({ onUpload, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size too large (max 10MB)");
      return;
    }

    setFile(selectedFile);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: e.dataTransfer.files } });
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

    setIsUploading(true);

    try {
      const result = await onUpload({
        file,
        title,
        description
      });

      if (result && result.success) {
        resetForm();
        if (onClose) onClose();
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

      <form onSubmit={handleSubmit} className="upload-form">
        {preview ? (
          <div className="preview-container">
            <div className="image-wrapper">
              <img 
                src={preview} 
                alt="Preview" 
                className="preview-image" 
                style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
            <div className="upload-controls">
              <button 
                type="button" 
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="btn btn-outline"
              >
                Replace Image
              </button>
            </div>
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
            </div>
            <input
              type="file"
              name="photo"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
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