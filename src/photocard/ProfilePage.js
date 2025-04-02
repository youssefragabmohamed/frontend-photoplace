import React, { useState } from "react";

const UploadPhoto = ({ onUpload }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!localStorage.getItem("token")) {
      setError("Please log in to upload photos.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("photo", file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      if (!response.ok) throw new Error((await response.json()).message || "Upload failed");
      onUpload((await response.json()).photo);
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ padding: "var(--space-lg)" }}>
        <h2>Upload Photo</h2>
        {error && <div className="notification error" style={{ marginBottom: "var(--space-md)" }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="grid" style={{ gap: "var(--space-md)" }}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            style={{ minHeight: "100px" }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="form-input"
            required
          />
          <button type="submit" className="btn btn-primary">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPhoto;