"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const styles_module_css_1 = __importDefault(require("./styles.module.css"));
const DetourRouteSearch = ({ apiClient, setRoutes, setSelectedRouteIndex }) => {
    const [startQuery, setStartQuery] = (0, react_1.useState)('');
    const [detourQuery, setDetourQuery] = (0, react_1.useState)('');
    const [endQuery, setEndQuery] = (0, react_1.useState)('');
    const [startResults, setStartResults] = (0, react_1.useState)([]);
    const [detourResults, setDetourResults] = (0, react_1.useState)([]);
    const [endResults, setEndResults] = (0, react_1.useState)([]);
    const [selectedStart, setSelectedStart] = (0, react_1.useState)(null);
    const [selectedDetour, setSelectedDetour] = (0, react_1.useState)(null);
    const [selectedEnd, setSelectedEnd] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [transportMode, setTransportMode] = (0, react_1.useState)('driving');
    (0, react_1.useEffect)(() => {
        const handleTransportChange = (e) => {
            const customEvent = e;
            if (customEvent.detail === 'taxi' || customEvent.detail === 'bus') {
                setTransportMode('driving');
            }
            else if (customEvent.detail === 'moto') {
                setTransportMode('cycling');
            }
        };
        window.addEventListener('transportChange', handleTransportChange);
        return () => window.removeEventListener('transportChange', handleTransportChange);
    }, []);
    const handleSearch = async (query, setResults) => {
        if (!query)
            return;
        setLoading(true);
        setError(null);
        try {
            const places = await apiClient.searchPlaces(query);
            setResults(places);
            if (places.length === 0) {
                setError('Aucun lieu trouvé');
            }
        }
        catch (err) {
            setError('Erreur lors de la recherche');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSelectStart = (place) => {
        setStartQuery(place.name);
        setSelectedStart(place);
        setStartResults([]);
        setRoutes([]);
        setSelectedRouteIndex(0);
    };
    const handleSelectDetour = (place) => {
        setDetourQuery(place.name);
        setSelectedDetour(place);
        setDetourResults([]);
        setRoutes([]);
        setSelectedRouteIndex(0);
    };
    const handleSelectEnd = (place) => {
        setEndQuery(place.name);
        setSelectedEnd(place);
        setEndResults([]);
        setRoutes([]);
        setSelectedRouteIndex(0);
    };
    const handleCalculateRoute = async () => {
        if (!selectedStart ||
            !selectedDetour ||
            !selectedEnd ||
            !selectedStart.coordinates ||
            !selectedDetour.coordinates ||
            !selectedEnd.coordinates) {
            setError('Veuillez sélectionner un départ, un détour et une destination');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const routes = await apiClient.calculateRouteWithDetour({
                lat: selectedStart.coordinates.lat,
                lng: selectedStart.coordinates.lng,
            }, {
                lat: selectedDetour.coordinates.lat,
                lng: selectedDetour.coordinates.lng,
            }, {
                lat: selectedEnd.coordinates.lat,
                lng: selectedEnd.coordinates.lng,
            }, transportMode, selectedStart.name, selectedDetour.name, selectedEnd.name);
            setRoutes(routes);
            setSelectedRouteIndex(0);
        }
        catch (err) {
            setError('Erreur lors du calcul de l\'itinéraire');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.routeSearchSection, children: [(0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.searchGroup, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "start", className: styles_module_css_1.default.label, children: "D\u00E9part" }), (0, jsx_runtime_1.jsx)("input", { id: "start", type: "text", value: startQuery, onChange: (e) => {
                            setStartQuery(e.target.value);
                            handleSearch(e.target.value, setStartResults);
                        }, placeholder: "Point de d\u00E9part", className: styles_module_css_1.default.searchInput }), startResults.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { className: styles_module_css_1.default.searchResults, children: startResults.map((place) => ((0, jsx_runtime_1.jsx)("li", { onClick: () => handleSelectStart(place), className: styles_module_css_1.default.searchResultItem, children: place.name }, place.id))) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.searchGroup, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "detour", className: styles_module_css_1.default.label, children: "D\u00E9tour" }), (0, jsx_runtime_1.jsx)("input", { id: "detour", type: "text", value: detourQuery, onChange: (e) => {
                            setDetourQuery(e.target.value);
                            handleSearch(e.target.value, setDetourResults);
                        }, placeholder: "Point de d\u00E9tour", className: styles_module_css_1.default.searchInput }), detourResults.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { className: styles_module_css_1.default.searchResults, children: detourResults.map((place) => ((0, jsx_runtime_1.jsx)("li", { onClick: () => handleSelectDetour(place), className: styles_module_css_1.default.searchResultItem, children: place.name }, place.id))) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.searchGroup, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "end", className: styles_module_css_1.default.label, children: "Destination" }), (0, jsx_runtime_1.jsx)("input", { id: "end", type: "text", value: endQuery, onChange: (e) => {
                            setEndQuery(e.target.value);
                            handleSearch(e.target.value, setEndResults);
                        }, placeholder: "Point d'arriv\u00E9e", className: styles_module_css_1.default.searchInput }), endResults.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { className: styles_module_css_1.default.searchResults, children: endResults.map((place) => ((0, jsx_runtime_1.jsx)("li", { onClick: () => handleSelectEnd(place), className: styles_module_css_1.default.searchResultItem, children: place.name }, place.id))) }))] }), error && (0, jsx_runtime_1.jsx)("div", { className: styles_module_css_1.default.error, children: error }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCalculateRoute, disabled: loading || !selectedStart || !selectedDetour || !selectedEnd, className: `${styles_module_css_1.default.searchButton} ${loading || !selectedStart || !selectedDetour || !selectedEnd ? styles_module_css_1.default.disabled : ''}`, children: loading ? 'Calcul...' : 'Calculer l\'itinéraire' })] }));
};
exports.default = DetourRouteSearch;
