import React from "react";

const PlaceholderCard = ({ index }) => {
  return (
    <div className={`placeholder-card placeholder-${index % 10}`}>
      Loading...
    </div>
  );
};

export default PlaceholderCard;