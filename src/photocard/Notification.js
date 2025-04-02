import React, { useState, useEffect } from "react";

const Notification = ({ message, type = "info", onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={`notification ${type}`}>
      <div className="flex" style={{ alignItems: "center", gap: "var(--space-sm)" }}>
        {message}
        <button 
          onClick={() => setVisible(false)} 
          className="btn btn-outline" 
          style={{ 
            marginLeft: "var(--space-md)",
            padding: "var(--space-xs)",
            minWidth: "unset"
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;