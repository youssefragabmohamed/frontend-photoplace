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
    
    if (query) {
      performSearch(1, true);
    }
  }, [query, type]);

  const performSearch = async (pageNum, isNewSearch = false) => {
    const searchId = Date.now().toString();
    currentSearchRef.current = searchId;
    
    try {
      abortControllerRef.current = new AbortController();

      if (isNewSearch) {
        setLoading(true);
      }
      setError(null);

      if (!query.trim()) {
        if (type === 'photos') {
          setPhotos([]);
        } else {
          setUsers([]);
        }
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const endpoint = type === 'photos' 
        ? `${process.env.REACT_APP_API_URL}/api/photos/search?q=${encodeURIComponent(query)}&page=${pageNum}&limit=12`
        : `${process.env.REACT_APP_API_URL}/api/users/search?q=${encodeURIComponent(query)}&page=${pageNum}&limit=12`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: abortControllerRef.current.signal
      });

      if (currentSearchRef.current !== searchId) {
        return;
      }

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();

      if (type === 'photos') {
        setPhotos(prev => isNewSearch ? data.photos : [...prev, ...data.photos]);
        setHasMore(data.pagination.page < data.pagination.pages);
      } else {
        setUsers(prev => isNewSearch ? data.users : [...prev, ...data.users]);
        setHasMore(data.pagination.page < data.pagination.pages);
      }
      
      setPage(pageNum);
    } catch (err) {
      if (err.name !== 'AbortError' && currentSearchRef.current === searchId) {
        setError(err.message);
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

  const handleSearch = ({ query: newQuery, type: newType }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
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
        <div className="search-results-container">
          <Photobox
            photos={photos}
            onPhotoClick={(photo) => navigate(`/photos/${photo._id}`)}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      ) : !loading && query ? (
        <div className="no-results">
          <h3>No photos found</h3>
          <p>Try adjusting your search</p>
        </div>
      ) : null;
    } else {
      return users.length > 0 ? (
        <div className="search-results-container">
          <div className="users-grid">
            {users.map(user => (
              <div key={user._id} className="user-card" onClick={() => navigate(`/profile/${user._id}`)}>
                <img src={user.profilePicture || '/default-avatar.png'} alt={user.username} className="user-avatar" />
                <div className="user-info">
                  <h3>{user.username}</h3>
                  {user.fullName && <p className="user-name">{user.fullName}</p>}
                  {user.bio && <p className="user-bio">{user.bio}</p>}
                  <div className="user-stats">
                    <span>{user.followerCount} followers</span>
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

      {loading && (photos.length === 0 && users.length === 0) && query.trim() && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Searching for {type}...</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage; 