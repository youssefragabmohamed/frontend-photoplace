import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
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
  const [navLock, setNavLock] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Token management
  const storeAuthData = (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      const storedUser = localStorage.getItem('userData');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (token) {
        await verifyToken(token);
      } else {
        setLoading(false);
        if (location.pathname !== '/login' && location.pathname !== '/signup') {
          navigate('/login', { replace: true });
        }
      }
    };

    initializeAuth();
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        storeAuthData(token, data.user);
        if (location.state?.from) {
          navigate(location.state.from, { replace: true });
        }
      } else {
        clearAuthData();
        setUser(null);
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      clearAuthData();
      setUser(null);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // Fetch photos when user is authenticated
  const fetchPhotos = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
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

  useEffect(() => {
    fetchPhotos();
  }, [user]);

  const getActiveRoute = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/search') return 'search';
    if (path === '/upload') return 'upload';
    if (path.startsWith('/profile')) return 'profile';
    return '';
  };

  const handleNavClick = (path) => {
    if (!navLock && location.pathname !== path) {
      setNavLock(true);
      navigate(path);
      setTimeout(() => setNavLock(false), 500);
    }
  };

  const handleSignUp = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      storeAuthData(data.token, data.user);
      setUser(data.user);
      setNotification({ message: "Account created!", type: "success" });
      navigate('/', { replace: true });
      return { success: true, data };
    } catch (error) {
      setNotification({ message: error.message || "Signup failed", type: "error" });
      throw error;
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

      storeAuthData(data.token, data.user);
      setUser(data.user);
      setNotification({ message: "Login successful", type: "success" });
      navigate(location.state?.from || '/', { replace: true });
      return { success: true, data };
    } catch (error) {
      setNotification({ message: error.message || "Login failed", type: "error" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = getAuthToken();
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      clearAuthData();
      setUser(null);
      setPhotos([]);
      setFilteredPhotos([]);
      setNotification({ message: "Logged out successfully", type: "success" });
      navigate('/login', { replace: true });
    } catch (error) {
      setNotification({ message: "Logout failed", type: "error" });
    }
  };

  const handleUpload = async (newPhoto) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("photo", newPhoto.file);
      formData.append("title", newPhoto.title);
      if (newPhoto.description) {
        formData.append("description", newPhoto.description);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos/upload`, {
        method: "POST",
        body: formData,
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      await fetchPhotos();
      setNotification({ 
        message: "Photo uploaded successfully!", 
        type: "success" 
      });
      navigate(`/photo/${data.photo._id}`);
      return { success: true, data };
    } catch (error) {
      setNotification({ 
        message: error.message || "Upload failed", 
        type: "error" 
      });
      throw error;
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }
      
      await fetchPhotos();
      setNotification({ message: "Photo deleted", type: "success" });
    } catch (error) {
      setNotification({ message: error.message || "Delete failed", type: "error" });
      throw error;
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
            element={!user ? <SignUpPage onSignUp={handleSignUp} /> : <Navigate to="/" replace />}
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
          <div 
            onClick={() => handleNavClick('/')}
            className={`nav-item ${getActiveRoute() === 'home' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </div>
          <div 
            onClick={() => handleNavClick('/search')}
            className={`nav-item ${getActiveRoute() === 'search' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faSearch} />
            <span>Search</span>
          </div>
          <div 
            onClick={() => handleNavClick('/upload')}
            className={`nav-item ${getActiveRoute() === 'upload' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faPlusSquare} />
            <span>Upload</span>
          </div>
          <div 
            onClick={() => handleNavClick(`/profile/${user._id}`)}
            className={`nav-item ${getActiveRoute() === 'profile' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Profile</span>
          </div>
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