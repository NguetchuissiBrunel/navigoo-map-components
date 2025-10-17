import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parse } from 'wellknown';
import { Place, Route, GeolocationResult } from '../lib/type';
import { ApiClient } from '../lib/api';

interface MapViewProps {
  apiClient: ApiClient;
  userLocation?: GeolocationResult | null;
  searchedPlace?: Place | null;
  routes?: Route[];
  selectedRouteIndex: number;
  setSelectedRouteIndex: (index: number) => void;
}

const MapView: React.FC<MapViewProps> = ({
  apiClient,
  userLocation,
  searchedPlace,
  routes,
  selectedRouteIndex,
  setSelectedRouteIndex,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);
  const routePolylinesRef = useRef<L.Polyline[]>([]);

  // 📍 Définition des limites du Cameroun
  const CAMEROON_BOUNDS = L.latLngBounds(
    [1.65, 8.4],   // Coin sud-ouest
    [13.08, 16.2]  // Coin nord-est
  );

  const parseWKTLineString = (wkt: string): [number, number][] => {
    try {
      const geo = parse(wkt);
      if (geo && geo.type === 'LineString' && Array.isArray(geo.coordinates)) {
        return geo.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
      }
    } catch (error) {
      console.error('wellknown parsing failed:', error);
    }
    const match = wkt.match(/LINESTRING\s*\(([^)]+)\)/);
    if (match) {
      return match[1]
        .split(',')
        .map(coord => {
          const [lng, lat] = coord.trim().split(' ').map(Number);
          return [lat, lng] as [number, number];
        });
    }
    return [];
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const maxZoom = 18;
      
      // 🌍 Configuration initiale de la carte
      mapRef.current = L.map(mapContainerRef.current, {
        center: [7.3697, 12.3547], // Centre géographique du Cameroun
        zoom: 6,
        minZoom: 5, // Permet un léger recul
        maxZoom,
        maxBounds: CAMEROON_BOUNDS,
        maxBoundsViscosity: 1.0,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom,
      }).addTo(mapRef.current);

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      routeLayerRef.current = L.layerGroup().addTo(mapRef.current);

      // 🧭 Afficher tout le Cameroun dès le départ
      mapRef.current.fitBounds(CAMEROON_BOUNDS, { animate: false });
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [apiClient]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Nettoyage
    routeLayerRef.current?.clearLayers();
    routePolylinesRef.current = [];

    if (routes && routes.length > 0) {
      let allCoordinates: [number, number][] = [];

      routes.forEach((route, index) => {
        const coordinates: [number, number][] = [];
        route.steps.forEach(step => {
          const latLngs = parseWKTLineString(step.geometry);
          if (latLngs.length > 0) coordinates.push(...latLngs);
        });

        if (coordinates.length > 0) {
          const color = index === selectedRouteIndex ? 'green' : 'black';
          const polyline = L.polyline(coordinates, { color, weight: 4, opacity: 0.8 })
            .addTo(routeLayerRef.current!)
            .on('click', () => setSelectedRouteIndex(index));
          routePolylinesRef.current.push(polyline);
          allCoordinates.push(...coordinates);
        }
      });

      // 🗺 Ajustement intelligent de la vue
      const routeBounds = L.latLngBounds(allCoordinates);
      const mergedBounds = routeBounds.extend(CAMEROON_BOUNDS); // Ne jamais sortir du pays
      mapRef.current.fitBounds(mergedBounds, { padding: [30, 30] });
    } 
    else if (!routes?.length) {
      // 🌍 Recentrage sur tout le Cameroun si aucun itinéraire
      mapRef.current.fitBounds(CAMEROON_BOUNDS, { animate: true });
    }
  }, [routes, selectedRouteIndex]);

  return <div ref={mapContainerRef} className="w-full h-screen rounded-xl overflow-hidden shadow-md" />;
};

export default MapView;