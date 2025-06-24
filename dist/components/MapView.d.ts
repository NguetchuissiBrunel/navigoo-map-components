import React from 'react';
import 'leaflet/dist/leaflet.css';
import { Place, Route, GeolocationResult } from '../lib/type';
import { ApiClient } from '../lib/api';
interface MapViewProps {
    apiClient: ApiClient;
    userLocation?: GeolocationResult | null;
    searchedPlace?: Place | null;
    routes?: Route[];
    selectedRouteIndex: number;
    setSelectedRouteIndex: (index: number) => void;
}
declare const MapView: React.FC<MapViewProps>;
export default MapView;
