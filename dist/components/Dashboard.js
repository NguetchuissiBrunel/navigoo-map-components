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
const styles_module_css_1 = __importDefault(require("./styles.module.css"));
const lucide_react_1 = require("lucide-react");
const Dashboard = ({ apiClient, setUserLocation, setSearchedPlace, setIsTracking, setRoutes, setSelectedRouteIndex, isTracking, }) => {
    const [activeSection, setActiveSection] = (0, react_1.useState)(null);
    const [geoLoading, setGeoLoading] = (0, react_1.useState)(false);
    const [geoError, setGeoError] = (0, react_1.useState)(null);
    const toggleSection = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };
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
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: styles_module_css_1.default.header, children: (0, jsx_runtime_1.jsxs)("h1", { className: styles_module_css_1.default.headerTitle, children: [(0, jsx_runtime_1.jsx)("span", { className: styles_module_css_1.default.titleAccent, children: "Navi" }), "goo"] }) }), (0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.mainContainer, children: [(0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.sidebar, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => toggleSection('geolocation'), className: `${styles_module_css_1.default.sidebarButton} ${activeSection === 'geolocation' ? styles_module_css_1.default.active : ''}`, title: "G\u00E9olocalisation et suivi", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Footprints, { size: 24, color: "#000" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => toggleSection('search'), className: `${styles_module_css_1.default.sidebarButton} ${activeSection === 'search' ? styles_module_css_1.default.active : ''}`, title: "Recherche de lieu", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 24, color: "#000" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => toggleSection('route'), className: `${styles_module_css_1.default.sidebarButton} ${activeSection === 'route' ? styles_module_css_1.default.active : ''}`, title: "Trac\u00E9 d'itin\u00E9raire", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { size: 24, color: "#000" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => toggleSection('routeWithDetour'), className: `${styles_module_css_1.default.sidebarButton} ${activeSection === 'routeWithDetour' ? styles_module_css_1.default.active : ''}`, title: "Trac\u00E9 d'itin\u00E9raire avec d\u00E9tour", children: (0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCcw, { size: 24, color: "#000" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: `${styles_module_css_1.default.contentPanel} ${activeSection ? styles_module_css_1.default.open : ''}`, children: [activeSection === 'geolocation' && ((0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.sectionContainer, children: [(0, jsx_runtime_1.jsxs)("h2", { className: styles_module_css_1.default.sectionTitle, children: [(0, jsx_runtime_1.jsx)("span", { className: styles_module_css_1.default.titleAccent, children: "G\u00E9o" }), "localisation"] }), (0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.toggleContainer, children: [(0, jsx_runtime_1.jsxs)("label", { className: styles_module_css_1.default.switch, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: isTracking, onChange: handleToggleTracking }), (0, jsx_runtime_1.jsx)("span", { className: styles_module_css_1.default.slider })] }), (0, jsx_runtime_1.jsxs)("span", { className: styles_module_css_1.default.toggleLabel, children: ["Suivi: ", isTracking ? 'Activé' : 'Désactivé'] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleGeolocation, className: styles_module_css_1.default.locationButton, disabled: geoLoading || isTracking, children: geoLoading ? ('Chargement...') : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { size: 18, color: "#000", style: { marginRight: '8px' } }), "Ma position"] })) }), geoError && (0, jsx_runtime_1.jsx)("div", { className: styles_module_css_1.default.error, children: geoError })] })), activeSection === 'search' && ((0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.sectionContainer, children: [(0, jsx_runtime_1.jsxs)("h2", { className: styles_module_css_1.default.sectionTitle, children: [(0, jsx_runtime_1.jsx)("span", { className: styles_module_css_1.default.titleAccent, children: "Re" }), "cherche"] }), (0, jsx_runtime_1.jsx)(SearchBar_1.default, { apiClient: apiClient, setUserLocation: setUserLocation, setSearchedPlace: setSearchedPlace })] })), activeSection === 'route' && ((0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.sectionContainer, children: [(0, jsx_runtime_1.jsxs)("h2", { className: styles_module_css_1.default.sectionTitle, children: [(0, jsx_runtime_1.jsx)("span", { className: styles_module_css_1.default.titleAccent, children: "Itin\u00E9" }), "raire"] }), (0, jsx_runtime_1.jsx)(RouteSearch_1.default, { apiClient: apiClient, setRoutes: setRoutes, setSelectedRouteIndex: setSelectedRouteIndex }), (0, jsx_runtime_1.jsx)(TransportOptions_1.default, {}), (0, jsx_runtime_1.jsx)(TripType_1.default, {})] })), activeSection === 'routeWithDetour' && ((0, jsx_runtime_1.jsxs)("div", { className: styles_module_css_1.default.sectionContainer, children: [(0, jsx_runtime_1.jsxs)("h2", { className: styles_module_css_1.default.sectionTitle, children: [(0, jsx_runtime_1.jsx)("span", { className: styles_module_css_1.default.titleAccent, children: "Itin\u00E9" }), "raire avec d\u00E9tour"] }), (0, jsx_runtime_1.jsx)(DetourRouteSearch_1.default, { apiClient: apiClient, setRoutes: setRoutes, setSelectedRouteIndex: setSelectedRouteIndex }), (0, jsx_runtime_1.jsx)(TransportOptions_1.default, {}), (0, jsx_runtime_1.jsx)(TripType_1.default, {})] }))] })] })] }));
};
exports.default = Dashboard;
