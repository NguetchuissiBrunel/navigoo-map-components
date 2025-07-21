"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const RouteSearch = ({ apiClient, setRoutes, setSelectedRouteIndex, className, searchGroupClassName, labelClassName, inputClassName, resultsClassName, resultItemClassName, errorClassName, buttonClassName, disabledButtonClassName, }) => {
    const [startQuery, setStartQuery] = (0, react_1.useState)('');
    const [endQuery, setEndQuery] = (0, react_1.useState)('');
    const [startResults, setStartResults] = (0, react_1.useState)([]);
    const [endResults, setEndResults] = (0, react_1.useState)([]);
    const [selectedStart, setSelectedStart] = (0, react_1.useState)(null);
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
    const handleSelectEnd = (place) => {
        setEndQuery(place.name);
        setSelectedEnd(place);
        setEndResults([]);
        setRoutes([]);
        setSelectedRouteIndex(0);
    };
    const handleCalculateRoute = async () => {
        if (!selectedStart || !selectedEnd || !selectedStart.coordinates || !selectedEnd.coordinates) {
            setError('Veuillez sélectionner un point de départ et une destination');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const routes = await apiClient.calculateRoute([
                { lat: selectedStart.coordinates.lat, lng: selectedStart.coordinates.lng },
                { lat: selectedEnd.coordinates.lat, lng: selectedEnd.coordinates.lng },
            ], transportMode, selectedStart.name, selectedEnd.name);
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, children: [(0, jsx_runtime_1.jsxs)("div", { className: searchGroupClassName, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "start", className: labelClassName, children: "D\u00E9part" }), (0, jsx_runtime_1.jsx)("input", { id: "start", type: "text", value: startQuery, onChange: (e) => {
                            setStartQuery(e.target.value);
                            handleSearch(e.target.value, setStartResults);
                        }, placeholder: "Point de d\u00E9part", className: inputClassName }), startResults.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { className: resultsClassName, children: startResults.map((place) => ((0, jsx_runtime_1.jsx)("li", { onClick: () => handleSelectStart(place), className: resultItemClassName, children: place.name }, place.id))) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: searchGroupClassName, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "end", className: labelClassName, children: "Destination" }), (0, jsx_runtime_1.jsx)("input", { id: "end", type: "text", value: endQuery, onChange: (e) => {
                            setEndQuery(e.target.value);
                            handleSearch(e.target.value, setEndResults);
                        }, placeholder: "Point d'arriv\u00E9e", className: inputClassName }), endResults.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { className: resultsClassName, children: endResults.map((place) => ((0, jsx_runtime_1.jsx)("li", { onClick: () => handleSelectEnd(place), className: resultItemClassName, children: place.name }, place.id))) }))] }), error && (0, jsx_runtime_1.jsx)("div", { className: errorClassName, children: error }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCalculateRoute, disabled: loading || !selectedStart || !selectedEnd, className: loading || !selectedStart || !selectedEnd ? disabledButtonClassName : buttonClassName, children: loading ? 'Calcul...' : 'Calculer l\'itinéraire' })] }));
};
exports.default = RouteSearch;
