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
import './App.css';

// Define API base URL with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://photoplace-backend-4i8v.onrender.com';

const App = () => {
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/photos`);
        
        // Check response type
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const text = await response.text();
          throw new Error(text.includes('<!doctype') 
            ? 'Server error: Received HTML instead of JSON' 
            : 'Invalid response format');
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setPhotos(data);
        setFilteredPhotos(data);
      } catch (error) {
        console.error('Photo fetch error:', error);
        setNotification({
          message: error.message || 'Failed to load photos',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      setUser({ _id: userId });
    }
  }, []);

  const handleSignUp = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");
      
      if (!data?.user?._id || !data.token) {
        throw new Error("Invalid server response format");
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      setUser(data.user);
      setNotification({ message: "Account created!", type: "success" });
      return data;
    } catch (error) {
      setNotification({
        message: error.message || "Signup failed",
        type: "error",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      
      if (!data?.user?._id || !data.token) {
        throw new Error("Invalid server response format");
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      setUser(data.user);
      setNotification({ message: "Login successful", type: "success" });
      return data;
    } catch (error) {
      setNotification({
        message: error.message || "Login failed",
        type: "error",
      });
      throw error;
    } finally {
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
      formData.append("userId", user._id);

      const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Upload failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setPhotos(prev => [...prev, data.photo]);
      setFilteredPhotos(prev => [...prev, data.photo]);
      setNotification({ message: "Upload successful!", type: "success" });
    } catch (error) {
      setNotification({
        message: error.message || "Upload failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Delete failed with status ${response.status}`);
      }
      
      setPhotos(prev => prev.filter(photo => photo._id !== photoId));
      setFilteredPhotos(prev => prev.filter(photo => photo._id !== photoId));
      setNotification({ message: "Photo deleted", type: "success" });
    } catch (error) {
      setNotification({
        message: error.message || "Delete failed",
        type: "error",
      });
    } finally {
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
          element={!user ? <SignUpPage handleSignUp={handleSignUp} /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!user ? <LoginPage handleLogin={handleLogin} /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={user ? (
            <>
              <SearchBar onSearch={setSearchQuery} />
              <PhotoGallery
                photos={filteredPhotos.filter(photo =>
                  photo?.title?.toLowerCase().includes(searchQuery.toLowerCase())
                )}
                onDeletePhoto={handleDeletePhoto}
              />
            </>
          ) : <Navigate to="/login" />}
        />
        <Route path="/photo/:id" element={<PhotoDetail />} />
        <Route element={<PrivateRoute />}>
          <Route path="/upload" element={<UploadPhoto onUpload={handleUpload} />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;