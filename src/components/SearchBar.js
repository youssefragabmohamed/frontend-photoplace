import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="container" style={{ marginBottom: "var(--space-lg)" }}>
      <div className="flex" style={{ 
        gap: "var(--space-md)",
        alignItems: "center"
      }}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search photos..."
          className="form-input"
          style={{ flex: 1 }}
        />
        <select className="form-input" style={{ width: "150px" }}>
          <option value="">All</option>
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar;