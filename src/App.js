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

  const handleSignUp = (loadingState) => setLoading(loadingState);

  const handleUpload = (newPhoto) => {
    setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
    setFilteredPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
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
              <SignUpPage handleLoading={handleSignUp} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/login"
          element={
            !user ? (
              <LoginPage setUser={setUser} />
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