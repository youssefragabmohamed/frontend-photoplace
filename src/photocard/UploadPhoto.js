import React, { useState } from "react";

const UploadPhoto = ({ onUpload }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const userId = localStorage.getItem("userId"); // Get userId from localStorage
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("photo", file);
    formData.append("userId", userId); // Add userId to the form data

    // Debugging: Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await fetch("http://192.168.1.109:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      onUpload(data); // Notify parent component of the new photo
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="upload-photo">
      <h2>Upload Photo</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="upload-input"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="upload-textarea"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className="upload-input"
        />
        <button type="submit" className="upload-button">
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadPhoto;