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
      mapRef.current = L.map(mapContainerRef.current, {
        center: [3.8480, 11.5021], // Centre par défaut : Yaoundé
        zoom: 12,
        minZoom: 11,
        maxZoom: 16,
        maxBounds: [[3.7, 11.4], [4.0, 11.6]],
        maxBoundsViscosity: 1.0,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 16,
      }).addTo(mapRef.current);

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      routeLayerRef.current = L.layerGroup().addTo(mapRef.current);

      mapRef.current.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const closestPlace = await apiClient.findClosestPlace(lat, lng);
        const placeName = closestPlace?.name || 'Position sélectionnée';

        if (clickMarkerRef.current) {
          mapRef.current?.removeLayer(clickMarkerRef.current);
          clickMarkerRef.current = null;
        } else {
          clickMarkerRef.current = L.marker([lat, lng])
            .addTo(mapRef.current!)
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

  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLayerRef.current) routeLayerRef.current.clearLayers();
    if (markerRef.current) markerRef.current.remove();
    if (clickMarkerRef.current) clickMarkerRef.current.remove();
    routePolylinesRef.current = [];

    const centerOnPoint = async (lat: number, lng: number, placeName: string, zoom: number = 16) => {
      let displayName = placeName;
      if (placeName === 'Votre position') {
        const closestPlace = await apiClient.findClosestPlace(lat, lng);
        displayName = closestPlace?.name || placeName;
      }
      mapRef.current!.setView([lat, lng], zoom, { animate: true });
      markerRef.current = L.marker([lat, lng])
        .addTo(mapRef.current!)
        .bindPopup(`<b>${displayName}</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
        .openPopup();
    };

    if (routes && routes.length > 0) {
      let allCoordinates: [number, number][] = [];
      routes.forEach((route, index) => {
        const coordinates: [number, number][] = [];
        route.steps.forEach((step) => {
          const latLngs = parseWKTLineString(step.geometry);
          if (latLngs.length > 0) coordinates.push(...latLngs);
        });

        if (coordinates.length > 0) {
          const color = index === selectedRouteIndex ? 'green' : 'black';
          const weight = index === selectedRouteIndex ? 5 : 3;
          const opacity = index === selectedRouteIndex ? 1.0 : 0.5;

          const polyline = L.polyline(coordinates, { color, weight, opacity })
            .addTo(routeLayerRef.current!)
            .on('click', (e: L.LeafletMouseEvent) => {
              L.DomEvent.stopPropagation(e);
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
              L.popup()
                .setLatLng(center)
                .setContent(`
                  <b>Route ${index + 1}</b><br>
                  Distance: ${route.distance.toFixed(2)} m<br>
                  Durée: ${(route.duration / 60).toFixed(2)} min<br>
                  Départ: ${route.startPlaceName || 'Départ'}<br>
                  Destination: ${route.endPlaceName || 'Destination'}
                `)
                .openOn(mapRef.current!);
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
              L.marker(startPoint).addTo(routeLayerRef.current!).bindPopup(`
                <b>${startPlaceName}</b><br>Lat: ${startPoint[0].toFixed(6)}<br>Lng: ${startPoint[1].toFixed(6)}
              `);
              L.marker(endPoint).addTo(routeLayerRef.current!).bindPopup(`
                <b>${route.endPlaceName || 'Destination'}</b><br>Lat: ${endPoint[0].toFixed(6)}<br>Lng: ${endPoint[1].toFixed(6)}
              `);
            })();
          }
        }
      });

      if (allCoordinates.length > 0) {
        mapRef.current!.fitBounds(L.latLngBounds(allCoordinates));
      }
    } else if (searchedPlace && searchedPlace.coordinates) {
      centerOnPoint(searchedPlace.coordinates.lat, searchedPlace.coordinates.lng, searchedPlace.name);
    } else if (userLocation) {
      centerOnPoint(userLocation.latitude, userLocation.longitude, 'Votre position');
    } else {
      mapRef.current!.setView([3.8480, 11.5021], 12, { animate: true });
    }
  }, [apiClient, userLocation, searchedPlace, routes, selectedRouteIndex, setSelectedRouteIndex]);

  return <div className="w-full h-screen" ref={mapContainerRef} />;
};

export default MapView;