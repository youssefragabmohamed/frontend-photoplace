import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhotoBox from "./Photobox";  // Import PhotoBox component

const tabs = ["Traditional", "Digital"];

const GalleryTabs = ({ photos, onDeletePhoto, fetchPhotos }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);  // Loading state to manage the fetching state
  const containerRef = useRef(null);

  useEffect(() => {
    const loadPhotos = async () => {
      setLoading(true);
      try {
        await fetchPhotos(); // Fetch the photos here
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, [fetchPhotos]); // Runs when component mounts

  const handleSwipe = (event, info) => {
    const offset = info.offset.x;

    if (offset < -50 && activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    } else if (offset > 50 && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  // Filter photos based on the active tab
  const filteredPhotos = photos.filter((photo) => {
    if (tabs[activeTab] === "Traditional") {
      return photo.category === "Traditional";
    } else if (tabs[activeTab] === "Digital") {
      return photo.category === "Digital";
    }
    return true;  // Default for all other cases
  });

  return (
    <div className="tabs-wrapper" style={{ overflow: "hidden" }}>
      <div
        className="tab-header"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`tab-button ${activeTab === index ? "active" : ""}`}
            style={{
              padding: "0.5rem 1rem",
              fontWeight: activeTab === index ? "bold" : "normal",
              background: activeTab === index ? "#eee" : "#fff",
              border: "none",
              borderBottom: activeTab === index ? "2px solid #333" : "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div ref={containerRef} style={{ position: "relative", height: "300px" }}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeTab}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleSwipe}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: "#f9f9f9",
              padding: "1rem",
              borderRadius: "1rem",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h2>{tabs[activeTab]} Gallery</h2>
            {/* Pass the loading state and filtered photos to PhotoBox */}
            <PhotoBox 
              photos={filteredPhotos} 
              loading={loading}  // Use the loading state here
              onDeletePhoto={onDeletePhoto}  // Handle photo deletion
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GalleryTabs;
