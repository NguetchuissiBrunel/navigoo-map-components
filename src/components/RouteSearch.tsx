import React, { useState, useEffect } from 'react';
import { Place, Route, GeolocationResult } from '../lib/type';
import { ApiClient } from '../lib/api';
import styles from './styles.module.css';

interface RouteSearchProps {
  apiClient: ApiClient;
  setRoutes: (routes: Route[]) => void;
  setSelectedRouteIndex: (index: number) => void;
}

const RouteSearch: React.FC<RouteSearchProps> = ({ apiClient, setRoutes, setSelectedRouteIndex }) => {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startResults, setStartResults] = useState<Place[]>([]);
  const [endResults, setEndResults] = useState<Place[]>([]);
  const [selectedStart, setSelectedStart] = useState<Place | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transportMode, setTransportMode] = useState<'driving' | 'walking' | 'cycling'>('driving');

  useEffect(() => {
    const handleTransportChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === 'taxi' || customEvent.detail === 'bus') {
        setTransportMode('driving');
      } else if (customEvent.detail === 'moto') {
        setTransportMode('cycling');
      }
    };
    window.addEventListener('transportChange', handleTransportChange);
    return () => window.removeEventListener('transportChange', handleTransportChange);
  }, []);

  const handleSearch = async (query: string, setResults: (results: Place[]) => void) => {
    if (!query) return;
    setLoading(true);
    setError(null);
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

  const handleSelectStart = (place: Place) => {
    setStartQuery(place.name);
    setSelectedStart(place);
    setStartResults([]);
    setRoutes([]);
    setSelectedRouteIndex(0);
  };

  const handleSelectEnd = (place: Place) => {
    setEndQuery(place.name);
    setSelectedEnd(place);
    setEndResults([]);
    setRoutes([]);
    setSelectedRouteIndex(0);
  };

  const handleCalculateRoute = async () => {
    if (!selectedStart || !selectedEnd || !selectedStart.coordinates || !selectedEnd.coordinates) {
      setError('Veuillez sélectionner un point de départ et une destination');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const routes = await apiClient.calculateRoute(
        [
          { lat: selectedStart.coordinates.lat, lng: selectedStart.coordinates.lng },
          { lat: selectedEnd.coordinates.lat, lng: selectedEnd.coordinates.lng },
        ],
        transportMode,
        selectedStart.name,
        selectedEnd.name
      );
      setRoutes(routes);
      setSelectedRouteIndex(0);
    } catch (err) {
      setError('Erreur lors du calcul de l\'itinéraire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.routeSearchSection}>
      <div className={styles.searchGroup}>
        <label htmlFor="start" className={styles.label}>Départ</label>
        <input
          id="start"
          type="text"
          value={startQuery}
          onChange={(e) => {
            setStartQuery(e.target.value);
            handleSearch(e.target.value, setStartResults);
          }}
          placeholder="Point de départ"
          className={styles.searchInput}
        />
        {startResults.length > 0 && (
          <ul className={styles.searchResults}>
            {startResults.map((place) => (
              <li
                key={place.id}
                onClick={() => handleSelectStart(place)}
                className={styles.searchResultItem}
              >
                {place.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={styles.searchGroup}>
        <label htmlFor="end" className={styles.label}>Destination</label>
        <input
          id="end"
          type="text"
          value={endQuery}
          onChange={(e) => {
            setEndQuery(e.target.value);
            handleSearch(e.target.value, setEndResults);
          }}
          placeholder="Point d'arrivée"
          className={styles.searchInput}
        />
        {endResults.length > 0 && (
          <ul className={styles.searchResults}>
            {endResults.map((place) => (
              <li
                key={place.id}
                onClick={() => handleSelectEnd(place)}
                className={styles.searchResultItem}
              >
                {place.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <button
        onClick={handleCalculateRoute}
        disabled={loading || !selectedStart || !selectedEnd}
        className={`${styles.searchButton} ${loading || !selectedStart || !selectedEnd ? styles.disabled : ''}`}
      >
        {loading ? 'Calcul...' : 'Calculer l\'itinéraire'}
      </button>
    </div>
  );
};

export default RouteSearch;