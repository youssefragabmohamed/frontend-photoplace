import React, { useState } from "react";

const UploadPhoto = ({ onUpload }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Get the JWT token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to upload photos.");
      return;
    }

    // 2. Prepare FormData (exclude userId; backend gets it from the token)
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("photo", file); // File from input

    try {
      // 3. Send request with the token in headers
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Critical for MongoDB auth
        },
        body: formData, // No need for Content-Type header with FormData
      });

      const data = await response.json();

      // 4. Handle errors (e.g., invalid token, MongoDB validation failed)
      if (!response.ok) {
        throw new Error(data.message || "Upload failed. Check your authentication.");
      }

      // 5. Success: Update parent component and reset form
      onUpload(data.photo);
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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadPhoto;