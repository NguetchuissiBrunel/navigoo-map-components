import React from 'react';
import { GeolocationResult, Place, Route } from '../lib/type';
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
declare const Dashboard: React.FC<DashboardProps>;
export default Dashboard;
