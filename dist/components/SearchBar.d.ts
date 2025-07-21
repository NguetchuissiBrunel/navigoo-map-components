import React from 'react';
import { Place, GeolocationResult } from '../lib/type';
import { ApiClient } from '../lib/api';
interface SearchBarProps {
    apiClient: ApiClient;
    setUserLocation: (location: GeolocationResult | null) => void;
    setSearchedPlace: (place: Place | null) => void;
    className?: string;
    inputClassName?: string;
    buttonClassName?: string;
    errorClassName?: string;
    resultsClassName?: string;
    resultItemClassName?: string;
}
declare const SearchBar: React.FC<SearchBarProps>;
export default SearchBar;
