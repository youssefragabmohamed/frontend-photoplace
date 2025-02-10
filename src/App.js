import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import PhotoGrid from './PhotoGrid';
import PhotoGallery from './photocard/PhotoGallery';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import SignUpPage from './photocard/SignUpPage'; // Your SignUpPage component

const App = () => {
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetching data from your API
  useEffect(() => {
    fetch('http://localhost:5000/photos')  // Make sure this is your correct API endpoint
      .then((response) => response.json())
      .then((data) => setPhotos(data))
      .catch((error) => console.error('Error fetching photos:', error));
  }, []);

  // Check if the user is logged in or needs to sign up
  useEffect(() => {
    const storedUser = localStorage.getItem("user"); // Check if user exists
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Set user if found
    } else {
      navigate("/signup"); // Redirect to signup page if no user is found
    }
  }, [navigate]);

  return (
    <Router>
      <div className="App">
        <Header />
        <SearchBar onSearch={setSearchQuery} />
        {/* Filtering photos based on search query */}
        <PhotoGrid
          photos={photos.filter((photo) =>
            photo.title.toLowerCase().includes(searchQuery.toLowerCase())
          )}
        />
        {/* You can still include the PhotoGallery component if needed */}
        <PhotoGallery />
        
        <Routes>
          {/* If user is logged in, show the main page; if not, show signup */}
          <Route path="/" element={user ? (
            <div>
              {/* Your main content here */}
              <h1>Welcome to the Main Page</h1>
              {/* Add your main page content, such as the search bar, photo grid, etc. */}
            </div>
          ) : <Navigate to="/signup" />} />
          
          <Route path="/signup" element={<SignUpPage setUser={setUser} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
