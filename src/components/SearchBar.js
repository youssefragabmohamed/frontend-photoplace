import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faImage, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';

const SearchBar = forwardRef(({ onSearch, initialQuery = '', initialType = 'photos' }, ref) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState(initialType);
  const [isSearching, setIsSearching] = useState(false);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const isComponentMounted = useRef(true);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setSearchComplete: () => {
      setIsSearching(false);
      setIsTabSwitching(false);
    }
  }));

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
        // Keep searching state true until we get a response
      }
    }, 500),
    [onSearch]
  );

  // Trigger search with proper validation
  useEffect(() => {
    if (isComponentMounted.current) {
      const validatedQuery = query.trim();
      
      // Only search if there's actually a query
      if (validatedQuery) {
        setIsSearching(true);
        debouncedSearch(validatedQuery, searchType);
      } else {
        // Clear results if query is empty
        onSearch({ query: '', type: searchType });
        setIsSearching(false);
        setIsTabSwitching(false);
      }
    }
    return () => debouncedSearch.cancel();
  }, [query, searchType, debouncedSearch, onSearch]);

  const handleClear = () => {
    if (isComponentMounted.current) {
      setQuery("");
      setSearchType("photos");
      setIsSearching(false);
      setIsTabSwitching(false);
      // Clear search results immediately
      onSearch({ query: '', type: 'photos' });
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
      
      // If there's a current query, search with new type
      const currentQuery = query.trim();
      if (currentQuery) {
        setIsSearching(true);
        debouncedSearch(currentQuery, type);
      }
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

      {/* Loading spinner - show immediately when typing */}
      {isSearching && query.trim() && (
        <div className="search-loading">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Searching...</span>
        </div>
      )}
    </div>
  );
});

export default SearchBar;