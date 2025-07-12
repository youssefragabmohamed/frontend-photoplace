import React from "react";

const PlaceholderCard = ({ index }) => {
  // Array of colorful gradients for Pinterest-like appearance
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  ];

  // More variety in heights for Pinterest-like appearance
  const heights = [180, 220, 280, 200, 250, 320, 190, 240, 300, 210, 260, 290, 170, 230, 270, 200, 240, 310, 180, 220, 280, 200, 250, 300];
  const height = heights[index % heights.length];
  const gradient = gradients[index % gradients.length];

  return (
    <div 
      className="masonry-item placeholder-card"
      style={{
        height: `${height}px`,
        borderRadius: "var(--radius-lg)",
        position: "relative",
        overflow: "hidden",
        animationDelay: `${index * 0.1}s`,
        background: gradient,
        boxShadow: "var(--shadow-md)",
        cursor: "pointer",
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-4px) scale(1.02)";
        e.target.style.boxShadow = "var(--shadow-lg)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0) scale(1)";
        e.target.style.boxShadow = "var(--shadow-md)";
      }}
    >
      {/* Decorative elements */}
      <div 
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)"
        }}
      />
      
      <div 
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          width: "60px",
          height: "8px",
          borderRadius: "4px",
          background: "rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(10px)"
        }}
      />
      
      <div 
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(255, 255, 255, 0.2)"
        }}
      />

      {/* Content placeholder */}
      <div 
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          padding: "20px",
          background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
          color: "white"
        }}
      >
        <div 
          style={{
            width: "70%",
            height: "16px",
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: "8px",
            marginBottom: "8px"
          }}
        />
        <div 
          style={{
            width: "50%",
            height: "12px",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "6px"
          }}
        />
      </div>

      {/* Sparkle effect */}
      <div 
        style={{
          position: "absolute",
          top: "30%",
          left: "20%",
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.8)",
          animation: "sparkle 2s ease-in-out infinite"
        }}
      />
      <div 
        style={{
          position: "absolute",
          top: "60%",
          right: "30%",
          width: "3px",
          height: "3px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.6)",
          animation: "sparkle 2s ease-in-out infinite 0.5s"
        }}
      />
      <div 
        style={{
          position: "absolute",
          top: "40%",
          left: "70%",
          width: "2px",
          height: "2px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.7)",
          animation: "sparkle 2s ease-in-out infinite 1s"
        }}
      />
    </div>
  );
};

export default PlaceholderCard;