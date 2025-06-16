import React, { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faImage, faUser } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({ onSearch, initialQuery = '', initialType = 'photos' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState(initialType);
  const [isSearching, setIsSearching] = useState(false);
  const isComponentMounted = useRef(true);

  // Update state when initial values change
  useEffect(() => {
    if (isComponentMounted.current) {
      setQuery(initialQuery);
      setSearchType(initialType);
    }
  }, [initialQuery, initialType]);

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
    debounce((searchQuery, type) => {
      if (isComponentMounted.current) {
        onSearch({ query: searchQuery, type });
        setIsSearching(false);
      }
    }, 500),
    [onSearch]
  );

  // Trigger search with proper validation
  useEffect(() => {
    if (isComponentMounted.current) {
      setIsSearching(true);
      const validatedQuery = query.trim();
      debouncedSearch(validatedQuery, searchType);
    }
    return () => debouncedSearch.cancel();
  }, [query, searchType, debouncedSearch]);

  const handleClear = () => {
    if (isComponentMounted.current) {
      setQuery("");
      setSearchType("photos");
    }
  };

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
          {query && (
            <button 
              onClick={handleClear} 
              className="clear-button"
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      {isSearching && (
        <div className="search-status" role="status">
          Searching...
        </div>
      )}
    </div>
  );
};

export default SearchBar;