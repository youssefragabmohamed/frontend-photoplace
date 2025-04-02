import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faPlusSquare, faUser, faCog } from '@fortawesome/free-solid-svg-icons';
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

const App = () => {
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const location = useLocation();

  // Store token in localStorage
  const storeAuthToken = (token) => {
    localStorage.setItem('authToken', token);
  };

  const clearAuthToken = () => {
    localStorage.removeItem('authToken');
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/session`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else if (response.status === 401) {
          // Clear invalid token
          clearAuthToken();
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos`, {
          credentials: 'include',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        
        if (!response.ok) throw new Error('Failed to load photos');
        
        const data = await response.json();
        setPhotos(data);
        setFilteredPhotos(data);
      } catch (error) {
        setNotification({ message: error.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPhotos();
  }, [user]);

  const getActiveRoute = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/search') return 'search';
    if (path === '/upload') return 'upload';
    if (path.startsWith('/profile')) return 'profile';
    return '';
  };

  const handleSignUp = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      storeAuthToken(data.token);
      setUser(data.user);
      setNotification({ message: "Account created!", type: "success" });
      return { success: true };
    } catch (error) {
      setNotification({ message: error.message || "Signup failed", type: "error" });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      storeAuthToken(data.token);
      setUser(data.user);
      setNotification({ message: "Login successful", type: "success" });
      return { success: true };
    } catch (error) {
      setNotification({ message: error.message || "Login failed", type: "error" });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = getAuthToken();
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: 'include',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      clearAuthToken();
      setUser(null);
      setPhotos([]);
      setFilteredPhotos([]);
      setNotification({ message: "Logged out successfully", type: "success" });
    } catch (error) {
      setNotification({ message: "Logout failed", type: "error" });
    }
  };

  const handleUpload = async (newPhoto) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("photo", newPhoto.file);
      formData.append("title", newPhoto.title);
      formData.append("description", newPhoto.description);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/upload`, {
        method: "POST",
        body: formData,
        credentials: 'include',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setPhotos(prev => [...prev, data.photo]);
      setFilteredPhotos(prev => [...prev, data.photo]);
      setNotification({ message: "Upload successful!", type: "success" });
      return { success: true };
    } catch (error) {
      setNotification({ message: error.message || "Upload failed", type: "error" });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      setPhotos(prev => prev.filter(photo => photo._id !== photoId));
      setFilteredPhotos(prev => prev.filter(photo => photo._id !== photoId));
      setNotification({ message: "Photo deleted", type: "success" });
    } catch (error) {
      setNotification({ message: error.message || "Delete failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Header user={user} onLogout={handleLogout} />
      
      {loading && (
        <div className="loading-overlay glass-card">
          <div className="loading-ring"></div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <main className="main-content">
        <Routes>
          <Route
            path="/signup"
            element={!user ? <SignUpPage handleSignUp={handleSignUp} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/login"
            element={!user ? <LoginPage handleLogin={handleLogin} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/"
            element={
              <PrivateRoute user={user}>
                <>
                  <SearchBar onSearch={setSearchQuery} />
                  <PhotoGallery
                    photos={filteredPhotos.filter(photo =>
                      photo?.title?.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    onDeletePhoto={handleDeletePhoto}
                  />
                </>
              </PrivateRoute>
            }
          />
          <Route 
            path="/photo/:id" 
            element={
              <PrivateRoute user={user}>
                <PhotoDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <PrivateRoute user={user}>
                <UploadPhoto onUpload={handleUpload} />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile/:userId" 
            element={
              <PrivateRoute user={user}>
                <ProfilePage user={user} />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </main>

      {user && (
        <nav className="bottom-nav">
          <NavLink 
            to="/" 
            className={`nav-item ${getActiveRoute() === 'home' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </NavLink>
          <NavLink 
            to="/search" 
            className={`nav-item ${getActiveRoute() === 'search' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faSearch} />
            <span>Search</span>
          </NavLink>
          <NavLink 
            to="/upload" 
            className={`nav-item ${getActiveRoute() === 'upload' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faPlusSquare} />
            <span>Upload</span>
          </NavLink>
          <NavLink 
            to={`/profile/${user._id}`} 
            className={`nav-item ${getActiveRoute() === 'profile' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Profile</span>
          </NavLink>
          <div 
            className="nav-item settings"
            onClick={() => setNotification({ message: "Settings coming soon!", type: "info" })}
          >
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;