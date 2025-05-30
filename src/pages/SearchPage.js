import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Photobox from '../photocard/Photobox';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [photos, setPhotos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const currentSearchRef = useRef('');

  // Get search parameters from URL
  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || 'all';
  const sortBy = searchParams.get('sort') || 'recent';
  const type = searchParams.get('type') || 'photos';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    // Reset state when search params change
    if (type === 'photos') {
      setPhotos([]);
    } else {
      setUsers([]);
    }
    setPage(1);
    setHasMore(true);
    setError(null);
    
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (query || (type === 'photos' && (location !== 'all' || sortBy !== 'recent'))) {
      performSearch(1, true);
    }
  }, [query, location, sortBy, type]);

  const performSearch = async (pageNum, isNewSearch = false) => {
    try {
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      const searchId = Date.now().toString();
      currentSearchRef.current = searchId;

      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const endpoint = type === 'photos' 
        ? `${process.env.REACT_APP_API_URL}/api/photos/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&sortBy=${encodeURIComponent(sortBy)}&page=${pageNum}`
        : `${process.env.REACT_APP_API_URL}/api/users/search?query=${encodeURIComponent(query)}&page=${pageNum}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: abortControllerRef.current.signal
      });

      // Check if this is still the current search
      if (currentSearchRef.current !== searchId) {
        return;
      }

      const data = await response.json();

      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch ${type}`);
      }

      if (!data.photos && !data.users) {
        throw new Error('Invalid response format from server');
      }
      
      if (type === 'photos') {
        setPhotos(prev => isNewSearch ? data.photos : [...prev, ...data.photos]);
      } else {
        setUsers(prev => isNewSearch ? data.users : [...prev, ...data.users]);
      }
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      // Only set error if it's not an abort error and not an auth error
      if (err.name !== 'AbortError') {
        setError(err.message);
        // Reset data on error if it's a new search
        if (isNewSearch) {
          if (type === 'photos') {
            setPhotos([]);
          } else {
            setUsers([]);
          }
        }
      }
    } finally {
      if (currentSearchRef.current === searchId) {
        setLoading(false);
      }
    }
  };

  const handleSearch = ({ query: newQuery, location: newLocation, sortBy: newSort, type: newType }) => {
    // Cancel any ongoing requests before updating search params
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Update URL with search parameters
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newType === 'photos') {
      if (newLocation !== 'all') params.set('location', newLocation);
      if (newSort !== 'recent') params.set('sort', newSort);
    }
    params.set('type', newType);
    
    setSearchParams(params);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      performSearch(page + 1);
    }
  };

  const renderResults = () => {
    if (type === 'photos') {
      return photos.length > 0 ? (
        <Photobox
          photos={photos}
          onPhotoClick={(photo) => navigate(`/photos/${photo._id}`)}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      ) : !loading && query ? (
        <div className="no-results">
          <h3>No photos found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : null;
    } else {
      return users.length > 0 ? (
        <div className="users-grid">
          {users.map(user => (
            <div key={user._id} className="user-card" onClick={() => navigate(`/profile/${user._id}`)}>
              <img src={user.profilePic} alt={user.username} className="user-avatar" />
              <div className="user-info">
                <h3>{user.username}</h3>
                {user.name && <p className="user-name">{user.name}</p>}
                {user.bio && <p className="user-bio">{user.bio}</p>}
                <div className="user-stats">
                  <span>{user.followersCount} followers</span>
                  <span>{user.followingCount} following</span>
                </div>
              </div>
            </div>
          ))}
          {hasMore && (
            <button className="load-more-btn" onClick={handleLoadMore} disabled={loading}>
              Load more
            </button>
          )}
        </div>
      ) : !loading && query ? (
        <div className="no-results">
          <h3>No users found</h3>
          <p>Try a different search term</p>
        </div>
      ) : null;
    }
  };

  return (
    <div className="search-page">
      <SearchBar
        onSearch={handleSearch}
        initialQuery={query}
        initialLocation={location}
        initialSortBy={sortBy}
        initialType={type}
      />

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="search-results">
        {renderResults()}
      </div>

      {loading && (photos.length === 0 && users.length === 0) && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Searching for {type}...</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage; 