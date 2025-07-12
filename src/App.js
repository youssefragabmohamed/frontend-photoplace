import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faPlusSquare, faUser, faCog } from '@fortawesome/free-solid-svg-icons';
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Photobox from "./photocard/Photobox";
import SignUpPage from "./photocard/SignUpPage";
import LoginPage from "./photocard/LoginPage";
import Notification from "./photocard/Notification";
import PhotoDetail from "./photocard/PhotoDetail";
import UploadPhoto from "./photocard/UploadPhoto";
import ProfilePage from "./photocard/ProfilePage";
import SearchPage from "./pages/SearchPage";
import PrivateRoute from "./photocard/PrivateRoute";
import GalleryTabs from "./components/GalleryTabs";
import './App.css';
import NotificationBell from './components/NotificationBell';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [photos, setPhotos] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Ensure we have a valid API URL
        const apiUrl = process.env.REACT_APP_API_URL;
        if (!apiUrl) {
          console.warn('REACT_APP_API_URL is not defined, clearing auth token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('userId', data.user._id); // Store user ID
        } else if (response.status === 401) {
          // Token is invalid or expired
          console.warn('Authentication token is invalid or expired');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          setUser(null);
        } else {
          // Other error, but don't clear token immediately
          console.error('Auth check failed with status:', response.status);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Only clear token on network errors, not on auth errors
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (userData) => {
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userId', userData.user._id); // Store user ID
    setUser(userData.user);
    setNotification({
      message: 'Successfully logged in!',
      type: 'success'
    });
  };

  const handleSignUp = async (userData) => {
    if (!userData.token) {
      throw new Error('No token received from server');
    }
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userId', userData.user._id); // Store user ID
    setUser(userData.user);
    setNotification({
      message: 'Account created successfully!',
      type: 'success'
    });
    return { success: true };
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId'); // Clear any cached user ID
    setUser(null);
    setPhotos([]); // Clear any cached photos
    setSearchQuery(""); // Clear search query
    setNotification({
      message: 'Successfully logged out!',
      type: 'success'
    });
  };

  const getActiveRoute = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.includes('/search')) return 'search';
    if (path.includes('/upload')) return 'upload';
    if (path.includes('/profile')) return 'profile';
    return '';
  };

  const handleNavClick = (path) => {
    // Always navigate to the path
    navigate(path);
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
                <GalleryTabs user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PrivateRoute user={user}>
                <SearchPage />
              </PrivateRoute>
            }
          />
          <Route 
            path="/photos/:id" 
            element={
              <PrivateRoute user={user}>
                <PhotoDetail user={user} />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <PrivateRoute user={user}>
                <UploadPhoto />
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
          <NotificationBell />
        </nav>
      )}
    </div>
  );
};

export default App;