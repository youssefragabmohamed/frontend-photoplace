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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/photos`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch photos: ${response.status}`);
        }
        const data = await response.json();
        setPhotos(data);
        setFilteredPhotos(data);
      } catch (error) {
        console.error("Photo fetch error:", error);
        setNotification({
          message: error.message || "Failed to load photos",
          type: "error",
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
      setUser({ _id: userId }); // Standardized to _id
    }
  }, []);

  const handleSignUp = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");
      
      if (!data?.user?._id || !data.token) {
        throw new Error("Invalid server response");
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      
      if (!data?.user?._id || !data.token) {
        throw new Error("Invalid server response");
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

  // ... (rest of your component remains the same)
};

export default App;