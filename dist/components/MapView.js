"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const leaflet_1 = __importDefault(require("leaflet"));
require("leaflet/dist/leaflet.css");
const wellknown_1 = require("wellknown");
const MapView = ({ apiClient, userLocation, searchedPlace, routes, selectedRouteIndex, setSelectedRouteIndex, }) => {
    const mapRef = (0, react_1.useRef)(null);
    const mapContainerRef = (0, react_1.useRef)(null);
    const markerRef = (0, react_1.useRef)(null);
    const routeLayerRef = (0, react_1.useRef)(null);
    const clickMarkerRef = (0, react_1.useRef)(null);
    const routePolylinesRef = (0, react_1.useRef)([]);
    const parseWKTLineString = (wkt) => {
        try {
            const geo = (0, wellknown_1.parse)(wkt);
            if (geo && geo.type === 'LineString' && Array.isArray(geo.coordinates)) {
                return geo.coordinates.map(([lng, lat]) => [lat, lng]);
            }
        }
        catch (error) {
            console.error('wellknown parsing failed:', error);
        }
        const match = wkt.match(/LINESTRING\s*\(([^)]+)\)/);
        if (match) {
            return match[1]
                .split(',')
                .map(coord => {
                const [lng, lat] = coord.trim().split(' ').map(Number);
                return [lat, lng];
            });
        }
        return [];
    };
    (0, react_1.useEffect)(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = leaflet_1.default.map(mapContainerRef.current, {
                center: [3.8480, 11.5021], // Centre par défaut : Yaoundé
                zoom: 12,
                minZoom: 11,
                maxZoom: 16,
                maxBounds: [[3.7, 11.4], [4.0, 11.6]],
                maxBoundsViscosity: 1.0,
            });
            leaflet_1.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 16,
            }).addTo(mapRef.current);
            leaflet_1.default.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
            routeLayerRef.current = leaflet_1.default.layerGroup().addTo(mapRef.current);
            mapRef.current.on('click', async (e) => {
                const { lat, lng } = e.latlng;
                const closestPlace = await apiClient.findClosestPlace(lat, lng);
                const placeName = closestPlace?.name || 'Position sélectionnée';
                if (clickMarkerRef.current) {
                    mapRef.current?.removeLayer(clickMarkerRef.current);
                    clickMarkerRef.current = null;
                }
                else {
                    clickMarkerRef.current = leaflet_1.default.marker([lat, lng])
                        .addTo(mapRef.current)
                        .bindPopup(`<b>${placeName}</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
                        .openPopup();
                }
            });
        }
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [apiClient]);
    (0, react_1.useEffect)(() => {
        if (!mapRef.current)
            return;
        if (routeLayerRef.current)
            routeLayerRef.current.clearLayers();
        if (markerRef.current)
            markerRef.current.remove();
        if (clickMarkerRef.current)
            clickMarkerRef.current.remove();
        routePolylinesRef.current = [];
        const centerOnPoint = async (lat, lng, placeName, zoom = 16) => {
            let displayName = placeName;
            if (placeName === 'Votre position') {
                const closestPlace = await apiClient.findClosestPlace(lat, lng);
                displayName = closestPlace?.name || placeName;
            }
            mapRef.current.setView([lat, lng], zoom, { animate: true });
            markerRef.current = leaflet_1.default.marker([lat, lng])
                .addTo(mapRef.current)
                .bindPopup(`<b>${displayName}</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
                .openPopup();
        };
        if (routes && routes.length > 0) {
            let allCoordinates = [];
            routes.forEach((route, index) => {
                const coordinates = [];
                route.steps.forEach((step) => {
                    const latLngs = parseWKTLineString(step.geometry);
                    if (latLngs.length > 0)
                        coordinates.push(...latLngs);
                });
                if (coordinates.length > 0) {
                    const color = index === selectedRouteIndex ? 'green' : 'black';
                    const weight = index === selectedRouteIndex ? 5 : 3;
                    const opacity = index === selectedRouteIndex ? 1.0 : 0.5;
                    const polyline = leaflet_1.default.polyline(coordinates, { color, weight, opacity })
                        .addTo(routeLayerRef.current)
                        .on('click', (e) => {
                        leaflet_1.default.DomEvent.stopPropagation(e);
                        setSelectedRouteIndex(index);
                        routePolylinesRef.current.forEach((pl, i) => {
                            pl.setStyle({
                                color: i === index ? 'green' : 'black',
                                weight: i === index ? 5 : 3,
                                opacity: i === index ? 1.0 : 0.5,
                            });
                        });
                        const bounds = polyline.getBounds();
                        const center = bounds.getCenter();
                        leaflet_1.default.popup()
                            .setLatLng(center)
                            .setContent(`
                  <b>Route ${index + 1}</b><br>
                  Distance: ${route.distance.toFixed(2)} m<br>
                  Durée: ${(route.duration / 60).toFixed(2)} min<br>
                  Départ: ${route.startPlaceName || 'Départ'}<br>
                  Destination: ${route.endPlaceName || 'Destination'}
                `)
                            .openOn(mapRef.current);
                    });
                    routePolylinesRef.current.push(polyline);
                    allCoordinates = [...allCoordinates, ...coordinates];
                    if (index === selectedRouteIndex) {
                        const startPoint = coordinates[0];
                        const endPoint = coordinates[coordinates.length - 1];
                        (async () => {
                            let startPlaceName = route.startPlaceName || 'Départ';
                            if (route.startPlaceName === 'Votre position') {
                                const closestStartPlace = await apiClient.findClosestPlace(startPoint[1], startPoint[0]);
                                startPlaceName = closestStartPlace?.name || route.startPlaceName;
                            }
                            leaflet_1.default.marker(startPoint).addTo(routeLayerRef.current).bindPopup(`
                <b>${startPlaceName}</b><br>Lat: ${startPoint[0].toFixed(6)}<br>Lng: ${startPoint[1].toFixed(6)}
              `);
                            leaflet_1.default.marker(endPoint).addTo(routeLayerRef.current).bindPopup(`
                <b>${route.endPlaceName || 'Destination'}</b><br>Lat: ${endPoint[0].toFixed(6)}<br>Lng: ${endPoint[1].toFixed(6)}
              `);
                        })();
                    }
                }
            });
            if (allCoordinates.length > 0) {
                mapRef.current.fitBounds(leaflet_1.default.latLngBounds(allCoordinates));
            }
        }
        else if (searchedPlace && searchedPlace.coordinates) {
            centerOnPoint(searchedPlace.coordinates.lat, searchedPlace.coordinates.lng, searchedPlace.name);
        }
        else if (userLocation) {
            centerOnPoint(userLocation.latitude, userLocation.longitude, 'Votre position');
        }
        else {
            mapRef.current.setView([3.8480, 11.5021], 12, { animate: true });
        }
    }, [apiClient, userLocation, searchedPlace, routes, selectedRouteIndex, setSelectedRouteIndex]);
    return (0, jsx_runtime_1.jsx)("div", { className: "w-full h-screen", ref: mapContainerRef });
};
exports.default = MapView;
