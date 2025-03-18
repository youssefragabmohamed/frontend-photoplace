import React, { useState, useEffect } from "react";

const Notification = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={`notification ${type}`}>
      {message}
      <button className="close-btn" onClick={() => setVisible(false)}>
        X
      </button>
    </div>
  );
};

export default Notification;