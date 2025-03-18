import React, { useState } from "react";

const SearchBar = ({ onSearch, onFilter }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    onFilter(e.target.value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search photos by title..."
        className="search-input"
      />
      <select onChange={handleFilterChange} className="filter-select">
        <option value="">Filter by</option>
        <option value="newest">Newest</option>
        <option value="popular">Most Popular</option>
        <option value="price">Price Range</option>
      </select>
    </div>
  );
};

export default SearchBar;