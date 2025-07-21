import React, { useState, useEffect, ReactNode } from 'react';
import { Place, Route } from '../lib/type';
import { ApiClient } from '../lib/api';

interface DetourRouteSearchProps {
  apiClient: ApiClient;
  setRoutes: (routes: Route[]) => void;
  setSelectedRouteIndex: (index: number) => void;
  className?: string;
  searchGroupClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  resultsClassName?: string;
  resultItemClassName?: string;
  errorClassName?: string;
  buttonClassName?: string;
  disabledButtonClassName?: string;
}

const DetourRouteSearch: React.FC<DetourRouteSearchProps> = ({
  apiClient,
  setRoutes,
  setSelectedRouteIndex,
  className,
  searchGroupClassName,
  labelClassName,
  inputClassName,
  resultsClassName,
  resultItemClassName,
  errorClassName,
  buttonClassName,
  disabledButtonClassName,
}) => {
  const [startQuery, setStartQuery] = useState('');
  const [detourQuery, setDetourQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startResults, setStartResults] = useState<Place[]>([]);
  const [detourResults, setDetourResults] = useState<Place[]>([]);
  const [endResults, setEndResults] = useState<Place[]>([]);
  const [selectedStart, setSelectedStart] = useState<Place | null>(null);
  const [selectedDetour, setSelectedDetour] = useState<Place | null>(null);
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

  const handleSelectDetour = (place: Place) => {
    setDetourQuery(place.name);
    setSelectedDetour(place);
    setDetourResults([]);
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
    if (
      !selectedStart ||
      !selectedDetour ||
      !selectedEnd ||
      !selectedStart.coordinates ||
      !selectedDetour.coordinates ||
      !selectedEnd.coordinates
    ) {
      setError('Veuillez sélectionner un départ, un détour et une destination');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const routes = await apiClient.calculateRouteWithDetour(
        {
          lat: selectedStart.coordinates.lat,
          lng: selectedStart.coordinates.lng,
        },
        {
          lat: selectedDetour.coordinates.lat,
          lng: selectedDetour.coordinates.lng,
        },
        {
          lat: selectedEnd.coordinates.lat,
          lng: selectedEnd.coordinates.lng,
        },
        transportMode,
        selectedStart.name,
        selectedDetour.name,
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
    <div className={className}>
      <div className={searchGroupClassName}>
        <label htmlFor="start" className={labelClassName}>Départ</label>
        <input
          id="start"
          type="text"
          value={startQuery}
          onChange={(e) => {
            setStartQuery(e.target.value);
            handleSearch(e.target.value, setStartResults);
          }}
          placeholder="Point de départ"
          className={inputClassName}
        />
        {startResults.length > 0 && (
          <ul className={resultsClassName}>
            {startResults.map((place) => (
              <li
                key={place.id}
                onClick={() => handleSelectStart(place)}
                className={resultItemClassName}
              >
                {place.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={searchGroupClassName}>
        <label htmlFor="detour" className={labelClassName}>Détour</label>
        <input
          id="detour"
          type="text"
          value={detourQuery}
          onChange={(e) => {
            setDetourQuery(e.target.value);
            handleSearch(e.target.value, setDetourResults);
          }}
          placeholder="Point de détour"
          className={inputClassName}
        />
        {detourResults.length > 0 && (
          <ul className={resultsClassName}>
            {detourResults.map((place) => (
              <li
                key={place.id}
                onClick={() => handleSelectDetour(place)}
                className={resultItemClassName}
              >
                {place.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={searchGroupClassName}>
        <label htmlFor="end" className={labelClassName}>Destination</label>
        <input
          id="end"
          type="text"
          value={endQuery}
          onChange={(e) => {
            setEndQuery(e.target.value);
            handleSearch(e.target.value, setEndResults);
          }}
          placeholder="Point d'arrivée"
          className={inputClassName}
        />
        {endResults.length > 0 && (
          <ul className={resultsClassName}>
            {endResults.map((place) => (
              <li
                key={place.id}
                onClick={() => handleSelectEnd(place)}
                className={resultItemClassName}
              >
                {place.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <div className={errorClassName}>{error}</div>}
      <button
        onClick={handleCalculateRoute}
        disabled={loading || !selectedStart || !selectedDetour || !selectedEnd}
        className={loading || !selectedStart || !selectedDetour || !selectedEnd ? disabledButtonClassName : buttonClassName}
      >
        {loading ? 'Calcul...' : 'Calculer l\'itinéraire'}
      </button>
    </div>
  );
};

export default DetourRouteSearch;