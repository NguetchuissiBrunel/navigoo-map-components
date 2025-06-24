import React, { useState } from 'react';
import { Place, GeolocationResult } from '../lib/type';
import { ApiClient } from '../lib/api';
import styles from './styles.module.css';

interface SearchBarProps {
  apiClient: ApiClient;
  setUserLocation: (location: GeolocationResult | null) => void;
  setSearchedPlace: (place: Place | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ apiClient, setUserLocation, setSearchedPlace }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query || loading) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setSearchedPlace(null);

    try {
      const places = await apiClient.searchPlaces(query);
      setResults(places);
      if (places.length === 0) {
        setError('Aucun lieu trouvé');
      }
    } catch (err) {
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place: Place) => {
    setQuery(place.name);
    if (place.coordinates) {
      setUserLocation({ latitude: place.coordinates.lat, longitude: place.coordinates.lng });
      setSearchedPlace(place);
    } else {
      setError('Lieu sans coordonnées valides');
    }
    setResults([]);
  };

  return (
    <div className={styles.searchSection}>
      <div className={styles.searchGroup}>
        <label htmlFor="search" className={styles.label}>Nom du lieu</label>
        <input
          id="search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un lieu"
          className={styles.searchInput}
        />
      </div>
      {error && <div className={styles.error}>{error}</div>}
      {results.length > 0 && (
        <ul className={styles.searchResults}>
          {results.map((place) => (
            <li
              key={place.id}
              onClick={() => handleSelect(place)}
              className={styles.searchResultItem}
            >
              {place.name}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={handleSearch}
        disabled={loading || !query}
        className={`${styles.searchButton} ${loading || !query ? styles.disabled : ''}`}
      >
        {loading ? 'Recherche...' : 'Rechercher'}
      </button>
    </div>
  );
};

export default SearchBar;