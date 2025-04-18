import React from "react";

const PlaceholderCard = ({ index }) => {
  return (
    <div 
      className="masonry-item glass-card"
      style={{
        gridRowEnd: `span ${Math.floor(Math.random() * 15) + 15}`,
        borderRadius: "var(--radius-lg)",
        position: "relative",
        overflow: "hidden",
        animationDelay: `${index * 0.1}s`
      }}
    >
      {/* Image placeholder */}
      <div 
        className="skeleton"
        style={{
          height: `${Math.random() * 200 + 150}px`,
          width: "100%",
          borderBottom: "1px solid var(--glass-border)"
        }}
      />
      
      {/* Content placeholder */}
      <div className="placeholder-content">
        <div className="placeholder-line long"></div>
        <div className="placeholder-line medium"></div>
      </div>
    </div>
  );
};

export default PlaceholderCard;