import React, { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faImage, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({ onSearch, initialQuery = '', initialType = 'photos' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState(initialType);
  const [isSearching, setIsSearching] = useState(false);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
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
        setIsTabSwitching(false);
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

  const handleTypeChange = (type) => {
    if (type !== searchType) {
      setIsTabSwitching(true);
      setSearchType(type);
    }
  };

  return (
    <div className="search-container">
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

      {/* Instagram-style filter tabs */}
      <div className="search-filter-tabs">
        <button
          className={`filter-tab ${searchType === 'photos' ? 'active' : ''}`}
          onClick={() => handleTypeChange('photos')}
          aria-label="Search photos"
          disabled={isTabSwitching}
        >
          <FontAwesomeIcon icon={faImage} />
          <span>Photos</span>
          {isTabSwitching && searchType === 'photos' && (
            <FontAwesomeIcon icon={faSpinner} className="tab-spinner" spin />
          )}
        </button>
        <button
          className={`filter-tab ${searchType === 'users' ? 'active' : ''}`}
          onClick={() => handleTypeChange('users')}
          aria-label="Search users"
          disabled={isTabSwitching}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Users</span>
          {isTabSwitching && searchType === 'users' && (
            <FontAwesomeIcon icon={faSpinner} className="tab-spinner" spin />
          )}
        </button>
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