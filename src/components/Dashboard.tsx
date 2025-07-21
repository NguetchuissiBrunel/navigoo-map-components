import React, { useState, useCallback } from 'react';
import { GeolocationResult, Place, Route } from '../lib/type';
import { getCurrentPosition } from '../lib/geolocalisation';
import SearchBar from './SearchBar';
import RouteSearch from './RouteSearch';
import DetourRouteSearch from './DetourRouteSearch';
import TransportOptions from './TransportOptions';
import TripType from './TripType';
import { ApiClient } from '../lib/api';

interface DashboardProps {
  apiClient: ApiClient;
  setUserLocation: (location: GeolocationResult | null) => void;
  setSearchedPlace: (place: Place | null) => void;
  setIsTracking: (tracking: boolean) => void;
  setRoutes: (routes: Route[]) => void;
  setSelectedRouteIndex: (index: number) => void;
  isTracking: boolean;
  className?: string; // Allow custom styling
}

const Dashboard: React.FC<DashboardProps> = ({
  apiClient,
  setUserLocation,
  setSearchedPlace,
  setIsTracking,
  setRoutes,
  setSelectedRouteIndex,
  isTracking,
  className,
}) => {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleToggleTracking = () => {
    setIsTracking(!isTracking);
    if (isTracking) {
      setUserLocation(null);
      setRoutes([]);
      setSelectedRouteIndex(0);
    }
  };

  const handleGeolocation = useCallback(async () => {
    if (geoLoading || isTracking) return;
    setGeoLoading(true);
    setGeoError(null);

    try {
      const position: GeolocationResult = await getCurrentPosition();
      setUserLocation(position);
      setGeoError(null);
      setRoutes([]);
      setSelectedRouteIndex(0);
    } catch {
      setGeoError('Impossible d\'obtenir votre position');
    } finally {
      setGeoLoading(false);
    }
  }, [geoLoading, isTracking, setUserLocation, setRoutes, setSelectedRouteIndex]);

  return (
    <div className={className}>
      {/* Geolocation Section */}
      <div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isTracking}
              onChange={handleToggleTracking}
            />
            Suivi: {isTracking ? 'Activé' : 'Désactivé'}
          </label>
        </div>
        <button
          onClick={handleGeolocation}
          disabled={geoLoading || isTracking}
        >
          {geoLoading ? 'Chargement...' : 'Ma position'}
        </button>
        {geoError && <div>{geoError}</div>}
      </div>

      {/* Search Section */}
      <div>
        <SearchBar
          apiClient={apiClient}
          setUserLocation={setUserLocation}
          setSearchedPlace={setSearchedPlace}
        />
      </div>

      {/* Route Search Section */}
      <div>
        <RouteSearch
          apiClient={apiClient}
          setRoutes={setRoutes}
          setSelectedRouteIndex={setSelectedRouteIndex}
        />
        <TransportOptions />
        <TripType />
      </div>

      {/* Detour Route Search Section */}
      <div>
        <DetourRouteSearch
          apiClient={apiClient}
          setRoutes={setRoutes}
          setSelectedRouteIndex={setSelectedRouteIndex}
        />
        <TransportOptions />
        <TripType />
      </div>
    </div>
  );
};

export default Dashboard;