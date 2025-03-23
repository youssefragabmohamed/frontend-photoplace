import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import PhotoGallery from "./photocard/PhotoGallery";
import SignUpPage from "./photocard/SignUpPage";
import LoginPage from "./photocard/LoginPage";
import Notification from "./photocard/Notification";
import PhotoDetail from "./photocard/PhotoDetail";
import UploadPhoto from "./photocard/UploadPhoto";
import ProfilePage from "./photocard/ProfilePage";
import PrivateRoute from "./photocard/PrivateRoute";
import './App.css'; // Ensure the global CSS file is imported

const App = () => {
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/photos`) // Updated endpoint with environment variable
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched photos:", data);
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format: Expected an array.");
        }
        setPhotos(data);
        setFilteredPhotos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching photos:", error.message);
        setNotification({
          message: "Failed to load photos. Please try again.",
          type: "error",
        });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      setUser({ userId });
    }
  }, []);

  const handleSignUp = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setNotification({ message: "User created successfully", type: "success" });
      setLoading(false);
      return data;
    } catch (error) {
      console.error("Error signing up:", error.message);
      setNotification({ message: "Error signing up. Please try again.", type: "error" });
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      setUser(data.user);
      setNotification({ message: "Login successful", type: "success" });
      setLoading(false);
      return data;
    } catch (error) {
      console.error("Error logging in:", error.message);
      setNotification({ message: "Error logging in. Please try again.", type: "error" });
      setLoading(false);
    }
  };

  const handleUpload = async (newPhoto) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("photo", newPhoto.file);
      formData.append("title", newPhoto.title);
      formData.append("description", newPhoto.description);
      formData.append("userId", user.userId);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setPhotos((prevPhotos) => [...prevPhotos, data.photo]);
      setFilteredPhotos((prevPhotos) => [...prevPhotos, data.photo]);
      setNotification({ message: "Photo uploaded successfully", type: "success" });
      setLoading(false);
    } catch (error) {
      console.error("Error uploading photo:", error.message);
      setNotification({ message: "Error uploading photo. Please try again.", type: "error" });
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo._id !== photoId));
      setFilteredPhotos((prevPhotos) => prevPhotos.filter((photo) => photo._id !== photoId));
      setNotification({ message: "Photo deleted successfully", type: "success" });
      setLoading(false);
    } catch (error) {
      console.error("Error deleting photo:", error.message);
      setNotification({ message: "Error deleting photo. Please try again.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Header user={user} setUser={setUser} />
      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <Routes>
        <Route
          path="/signup"
          element={
            !user ? (
              <SignUpPage handleSignUp={handleSignUp} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/login"
          element={
            !user ? (
              <LoginPage handleLogin={handleLogin} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <>
                <SearchBar onSearch={setSearchQuery} />
                <PhotoGallery
                  photos={filteredPhotos.filter(
                    (photo) =>
                      photo &&
                      photo.title &&
                      typeof photo.title === "string" &&
                      photo.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )}
                  onDeletePhoto={handleDeletePhoto}
                />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/photo/:id" element={<PhotoDetail />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/upload" element={<UploadPhoto onUpload={handleUpload} />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;