import React, { useState, useCallback } from 'react';
import { GeolocationResult, Place, Route } from '../lib/type';
import { getCurrentPosition } from '../lib/geolocalisation';
import SearchBar from './SearchBar';
import RouteSearch from './RouteSearch';
import DetourRouteSearch from './DetourRouteSearch';
import TransportOptions from './TransportOptions';
import TripType from './TripType';
import styles from './styles.module.css';
import { Footprints, Search, ArrowRight, RefreshCcw, MapPin } from 'lucide-react';
import { ApiClient } from '../lib/api';

interface DashboardProps {
  apiClient: ApiClient;
  setUserLocation: (location: GeolocationResult | null) => void;
  setSearchedPlace: (place: Place | null) => void;
  setIsTracking: (tracking: boolean) => void;
  setRoutes: (routes: Route[]) => void;
  setSelectedRouteIndex: (index: number) => void;
  isTracking: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  apiClient,
  setUserLocation,
  setSearchedPlace,
  setIsTracking,
  setRoutes,
  setSelectedRouteIndex,
  isTracking,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

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
    <div>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>
          <span className={styles.titleAccent}>Navi</span>goo
        </h1>
      </div>
      <div className={styles.mainContainer}>
        <div className={styles.sidebar}>
          <button
            onClick={() => toggleSection('geolocation')}
            className={`${styles.sidebarButton} ${activeSection === 'geolocation' ? styles.active : ''}`}
            title="Géolocalisation et suivi"
          >
            <Footprints size={24} color="#000" />
          </button>
          <button
            onClick={() => toggleSection('search')}
            className={`${styles.sidebarButton} ${activeSection === 'search' ? styles.active : ''}`}
            title="Recherche de lieu"
          >
            <Search size={24} color="#000" />
          </button>
          <button
            onClick={() => toggleSection('route')}
            className={`${styles.sidebarButton} ${activeSection === 'route' ? styles.active : ''}`}
            title="Tracé d'itinéraire"
          >
            <ArrowRight size={24} color="#000" />
          </button>
          <button
            onClick={() => toggleSection('routeWithDetour')}
            className={`${styles.sidebarButton} ${activeSection === 'routeWithDetour' ? styles.active : ''}`}
            title="Tracé d'itinéraire avec détour"
          >
            <RefreshCcw size={24} color="#000" />
          </button>
        </div>
        <div className={`${styles.contentPanel} ${activeSection ? styles.open : ''}`}>
          {activeSection === 'geolocation' && (
            <div className={styles.sectionContainer}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleAccent}>Géo</span>localisation
              </h2>
              <div className={styles.toggleContainer}>
                <label className={styles.switch}>
                  <input type="checkbox" checked={isTracking} onChange={handleToggleTracking} />
                  <span className={styles.slider}></span>
                </label>
                <span className={styles.toggleLabel}>
                  Suivi: {isTracking ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <button
                onClick={handleGeolocation}
                className={styles.locationButton}
                disabled={geoLoading || isTracking}
              >
                {geoLoading ? (
                  'Chargement...'
                ) : (
                  <>
                    <MapPin size={18} color="#000" style={{ marginRight: '8px' }} />
                    Ma position
                  </>
                )}
              </button>
              {geoError && <div className={styles.error}>{geoError}</div>}
            </div>
          )}
          {activeSection === 'search' && (
            <div className={styles.sectionContainer}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleAccent}>Re</span>cherche
              </h2>
              <SearchBar
                apiClient={apiClient}
                setUserLocation={setUserLocation}
                setSearchedPlace={setSearchedPlace}
              />
            </div>
          )}
          {activeSection === 'route' && (
            <div className={styles.sectionContainer}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleAccent}>Itiné</span>raire
              </h2>
              <RouteSearch
                apiClient={apiClient}
                setRoutes={setRoutes}
                setSelectedRouteIndex={setSelectedRouteIndex}
              />
              <TransportOptions />
              <TripType />
            </div>
          )}
          {activeSection === 'routeWithDetour' && (
            <div className={styles.sectionContainer}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleAccent}>Itiné</span>raire avec détour
              </h2>
              <DetourRouteSearch
                apiClient={apiClient}
                setRoutes={setRoutes}
                setSelectedRouteIndex={setSelectedRouteIndex}
              />
              <TransportOptions />
              <TripType />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;