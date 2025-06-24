import React from 'react';
import { Route } from '../lib/type';
import { ApiClient } from '../lib/api';
interface DetourRouteSearchProps {
    apiClient: ApiClient;
    setRoutes: (routes: Route[]) => void;
    setSelectedRouteIndex: (index: number) => void;
}
declare const DetourRouteSearch: React.FC<DetourRouteSearchProps>;
export default DetourRouteSearch;
