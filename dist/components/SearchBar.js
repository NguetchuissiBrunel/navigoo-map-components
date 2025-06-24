"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const styles_module_css_1 = __importDefault(require("./styles.module.css"));
const SearchBar = ({ apiClient, setUserLocation, setSearchedPlace }) => {
    const [query, setQuery] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [results, setResults] = (0, react_1.useState)([]);
    const [error, setError] = (0, react_1.useState)(null);
    const handleSearch = async () => {
        if (!query || loading)
            return;
        setLoading(true);
        setError(null);
        setResults([]);
        setSearchedPlace(null);
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
    const handleSelect = (place) => {
        setQuery(place.name);
        if (place.coordinates) {
            setUserLocation({ latitude: place.coordinates.lat, longitude: place.coordinates.lng });
            setSearchedPlace(place);
        }
        else {
            setError('Lieu sans coordonnées valides');
        }
        setResults([]);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.searchSection, children: [(0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.searchGroup, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "search", className: styles_module_css_1.default.label, children: "Nom du lieu" }), (0, jsx_runtime_1.jsx)("input", { id: "search", type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Rechercher un lieu", className: styles_module_css_1.default.searchInput })] }), error && (0, jsx_runtime_1.jsx)("div", { className: styles_module_css_1.default.error, children: error }), results.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { className: styles_module_css_1.default.searchResults, children: results.map((place) => ((0, jsx_runtime_1.jsx)("li", { onClick: () => handleSelect(place), className: styles_module_css_1.default.searchResultItem, children: place.name }, place.id))) })), (0, jsx_runtime_1.jsx)("button", { onClick: handleSearch, disabled: loading || !query, className: `${styles_module_css_1.default.searchButton} ${loading || !query ? styles_module_css_1.default.disabled : ''}`, children: loading ? 'Recherche...' : 'Rechercher' })] }));
};
exports.default = SearchBar;
