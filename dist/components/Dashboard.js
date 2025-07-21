"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const geolocalisation_1 = require("../lib/geolocalisation");
const SearchBar_1 = __importDefault(require("./SearchBar"));
const RouteSearch_1 = __importDefault(require("./RouteSearch"));
const DetourRouteSearch_1 = __importDefault(require("./DetourRouteSearch"));
const TransportOptions_1 = __importDefault(require("./TransportOptions"));
const TripType_1 = __importDefault(require("./TripType"));
const Dashboard = ({ apiClient, setUserLocation, setSearchedPlace, setIsTracking, setRoutes, setSelectedRouteIndex, isTracking, className, }) => {
    const [geoLoading, setGeoLoading] = (0, react_1.useState)(false);
    const [geoError, setGeoError] = (0, react_1.useState)(null);
    const handleToggleTracking = () => {
        setIsTracking(!isTracking);
        if (isTracking) {
            setUserLocation(null);
            setRoutes([]);
            setSelectedRouteIndex(0);
        }
    };
    const handleGeolocation = (0, react_1.useCallback)(async () => {
        if (geoLoading || isTracking)
            return;
        setGeoLoading(true);
        setGeoError(null);
        try {
            const position = await (0, geolocalisation_1.getCurrentPosition)();
            setUserLocation(position);
            setGeoError(null);
            setRoutes([]);
            setSelectedRouteIndex(0);
        }
        catch {
            setGeoError('Impossible d\'obtenir votre position');
        }
        finally {
            setGeoLoading(false);
        }
    }, [geoLoading, isTracking, setUserLocation, setRoutes, setSelectedRouteIndex]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: isTracking, onChange: handleToggleTracking }), "Suivi: ", isTracking ? 'Activé' : 'Désactivé'] }) }), (0, jsx_runtime_1.jsx)("button", { onClick: handleGeolocation, disabled: geoLoading || isTracking, children: geoLoading ? 'Chargement...' : 'Ma position' }), geoError && (0, jsx_runtime_1.jsx)("div", { children: geoError })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(SearchBar_1.default, { apiClient: apiClient, setUserLocation: setUserLocation, setSearchedPlace: setSearchedPlace }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(RouteSearch_1.default, { apiClient: apiClient, setRoutes: setRoutes, setSelectedRouteIndex: setSelectedRouteIndex }), (0, jsx_runtime_1.jsx)(TransportOptions_1.default, {}), (0, jsx_runtime_1.jsx)(TripType_1.default, {})] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(DetourRouteSearch_1.default, { apiClient: apiClient, setRoutes: setRoutes, setSelectedRouteIndex: setSelectedRouteIndex }), (0, jsx_runtime_1.jsx)(TransportOptions_1.default, {}), (0, jsx_runtime_1.jsx)(TripType_1.default, {})] })] }));
};
exports.default = Dashboard;
