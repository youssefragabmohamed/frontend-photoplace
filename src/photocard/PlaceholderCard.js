import React from "react";

const PlaceholderCard = ({ index }) => {
  return (
    <div 
      className="glass-card"
      style={{
        aspectRatio: "1/1.5",
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
          height: "70%",
          width: "100%",
          borderBottom: "1px solid var(--glass-border)"
        }}
      />
      
      {/* Content placeholder */}
      <div className="placeholder-content">
        <div className="placeholder-line long"></div>
        <div className="placeholder-line medium"></div>
        <div className="placeholder-line short"></div>
      </div>
    </div>
  );
};

export default PlaceholderCard;