import React, { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTimes, faImage, faUser } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({ onSearch, initialQuery = '', initialLocation = 'all', initialSortBy = 'recent', initialType = 'photos' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [searchType, setSearchType] = useState(initialType);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const isComponentMounted = useRef(true);

  // Update state when initial values change
  useEffect(() => {
    if (isComponentMounted.current) {
      setQuery(initialQuery);
      setLocation(initialLocation);
      setSortBy(initialSortBy);
      setSearchType(initialType);
    }
  }, [initialQuery, initialLocation, initialSortBy, initialType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      if (debouncedSearch) {
        debouncedSearch.cancel();
      }
    };
  }, []);

  // Debounced search function with proper cleanup
  const debouncedSearch = useCallback(
    debounce((searchQuery, searchLocation, searchSortBy, type) => {
      if (isComponentMounted.current) {
        onSearch({ query: searchQuery, location: searchLocation, sortBy: searchSortBy, type });
        setIsSearching(false);
      }
    }, 500),
    [onSearch]
  );

  // Trigger search with proper validation
  useEffect(() => {
    if (isComponentMounted.current) {
      setIsSearching(true);
      // Validate inputs before searching
      const validatedQuery = query.trim();
      const validatedLocation = validLocations.includes(location) ? location : 'all';
      const validatedSortBy = sortOptions.map(opt => opt.value).includes(sortBy) ? sortBy : 'recent';
      
      debouncedSearch(validatedQuery, validatedLocation, validatedSortBy, searchType);
    }
    return () => debouncedSearch.cancel();
  }, [query, location, sortBy, searchType, debouncedSearch]);

  const handleClear = () => {
    if (isComponentMounted.current) {
      setQuery("");
      setLocation("all");
      setSortBy("recent");
      setShowFilters(false);
    }
  };

  const validLocations = [
    { value: "all", label: "All Locations" },
    { value: "digital", label: "Digital" },
    { value: "nature", label: "Nature" },
    { value: "urban", label: "Urban" },
    { value: "studio", label: "Studio" }
  ];

  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "likes", label: "Most Liked" },
    { value: "oldest", label: "Oldest First" }
  ];

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Basic input sanitization
    const sanitizedValue = value.replace(/[<>]/g, '');
    setQuery(sanitizedValue);
  };

  return (
    <div className="search-container">
      <div className="search-type-toggle">
        <button
          className={`toggle-btn ${searchType === 'photos' ? 'active' : ''}`}
          onClick={() => setSearchType('photos')}
          aria-label="Search photos"
        >
          <FontAwesomeIcon icon={faImage} />
          Photos
        </button>
        <button
          className={`toggle-btn ${searchType === 'users' ? 'active' : ''}`}
          onClick={() => setSearchType('users')}
          aria-label="Search users"
        >
          <FontAwesomeIcon icon={faUser} />
          Users
        </button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={`Search ${searchType === 'photos' ? 'photos' : 'users'}...`}
            className="search-input"
            aria-label={`Search ${searchType}`}
            maxLength={50}
          />
          {(query || location !== "all" || sortBy !== "recent") && (
            <button 
              onClick={handleClear} 
              className="clear-button"
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        {searchType === 'photos' && (
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
          >
            <FontAwesomeIcon icon={faFilter} />
            Filters
          </button>
        )}
      </div>

      {showFilters && searchType === 'photos' && (
        <div className="search-filters" role="region" aria-label="Search filters">
          <div className="filter-group">
            <label htmlFor="location-select">Location:</label>
            <select
              id="location-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="filter-select"
            >
              {validLocations.map(loc => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {isSearching && (
        <div className="search-status" role="status">
          Searching...
        </div>
      )}
    </div>
  );
};

export default SearchBar;