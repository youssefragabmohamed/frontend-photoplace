import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, NavLink } from "react-router-dom";
import { faHome, faSearch, faPlusSquare, faUser, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
  const [authToken, setAuthToken] = useState(null);
  const location = useLocation();

  // Check active session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/session`, {
          credentials: 'include' // Required for httpOnly cookies
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Fetch photos
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to load photos');
        }

        const data = await response.json();
        setPhotos(data);
        setFilteredPhotos(data);
      } catch (error) {
        setNotification({
          message: error.message,
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPhotos();
    }
  }, [user]);

  // Get active route for bottom nav
  const getActiveRoute = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/search') return 'search';
    if (path === '/upload') return 'upload';
    if (path.startsWith('/profile')) return 'profile';
    return '';
  };

  // Handle signup
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

  // Handle login
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

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: 'include'
      });
      setUser(null);
      setNotification({ message: "Logged out successfully", type: "success" });
    } catch (error) {
      setNotification({
        message: "Logout failed",
        type: "error"
      });
    }
  };

  // Handle photo upload
  const handleUpload = async (newPhoto) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("photo", newPhoto.file);
      formData.append("title", newPhoto.title);
      formData.append("description", newPhoto.description);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/upload`, {
        method: "POST",
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
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

  // Handle photo deletion
  const handleDeletePhoto = async (photoId) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}`, {
        method: "DELETE",
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Delete failed');
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
      <Header user={user} onLogout={handleLogout} />
      
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

      <main className="main-content">
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
          <Route element={<PrivateRoute user={user} />}>
            <Route path="/upload" element={<UploadPhoto onUpload={handleUpload} />} />
            <Route path="/profile/:userId" element={<ProfilePage user={user} />} />
          </Route>
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
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