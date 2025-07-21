import React from 'react';
import { Route } from '../lib/type';
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
declare const DetourRouteSearch: React.FC<DetourRouteSearchProps>;
export default DetourRouteSearch;
