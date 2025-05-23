import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhotoBox from "./Photobox";
import "../App.css";

const tabs = ["Traditional", "Digital"];

const GalleryTabs = ({ photos, onDeletePhoto }) => {
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef(null);

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
      return photo.location === "traditional";
    } else if (tabs[activeTab] === "Digital") {
      return photo.location === "digital";
    }
    return true;
  });

  return (
    <div className="gallery-container">
      <div className="tab-header-container">
        <div className="tab-header">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`tab-button ${activeTab === index ? "active" : ""}`}
            >
              {tab}
              {activeTab === index && <div className="tab-indicator" />}
            </button>
          ))}
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="gallery-content-container"
      >
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
            className="gallery-content"
          >
            <h2 className="gallery-title">{tabs[activeTab]} Gallery</h2>
            <PhotoBox 
              photos={filteredPhotos} 
              loading={false} 
              onDeletePhoto={onDeletePhoto}
              selectedTab={tabs[activeTab].toLowerCase()}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GalleryTabs;