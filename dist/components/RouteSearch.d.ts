import React from 'react';
import { Route } from '../lib/type';
import { ApiClient } from '../lib/api';
interface RouteSearchProps {
    apiClient: ApiClient;
    setRoutes: (routes: Route[]) => void;
    setSelectedRouteIndex: (index: number) => void;
}
declare const RouteSearch: React.FC<RouteSearchProps>;
export default RouteSearch;
