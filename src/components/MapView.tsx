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

  // Définition des limites du Cameroun
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
      
      // Configuration de la carte avec limites strictes
      mapRef.current = L.map(mapContainerRef.current, {
        center: [5.5, 12.0], // Centre du Cameroun
        zoom: 6, // Zoom pour voir tout le Cameroun
        minZoom: 6,
        maxZoom: maxZoom,
        maxBounds: CAMEROON_BOUNDS,
        maxBoundsViscosity: 1.0, // Empêche complètement le dépassement des limites
      });

      // Forcer la carte à rester dans les limites initiales
      mapRef.current.setMaxBounds(CAMEROON_BOUNDS);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: maxZoom,
        tileSize: 256,
        zoomOffset: 0,
        bounds: CAMEROON_BOUNDS, // Limiter les tuiles aux bounds du Cameroun
      }).addTo(mapRef.current);

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      routeLayerRef.current = L.layerGroup().addTo(mapRef.current);

      // Recentrer la carte si l'utilisateur essaie de la faire sortir des limites
      mapRef.current.on('drag', () => {
        if (mapRef.current) {
          const currentCenter = mapRef.current.getCenter();
          const currentZoom = mapRef.current.getZoom();
          
          if (!CAMEROON_BOUNDS.contains(currentCenter)) {
            mapRef.current.panInsideBounds(CAMEROON_BOUNDS, { animate: true });
          }
        }
      });

      mapRef.current.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        // Vérifier que le clic est dans les limites du Cameroun
        if (!CAMEROON_BOUNDS.contains([lat, lng])) {
          return;
        }
        
        const closestPlace = await apiClient.findClosestPlace(lat, lng);
        const placeName = closestPlace?.name || 'Position sélectionnée';

        if (clickMarkerRef.current) {
          mapRef.current?.removeLayer(clickMarkerRef.current);
        }
        
        clickMarkerRef.current = L.marker([lat, lng])
          .addTo(mapRef.current!)
          .bindPopup(`<b>${placeName}</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
          .openPopup();
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

    // Nettoyer les couches précédentes
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    }
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (clickMarkerRef.current) {
      clickMarkerRef.current.remove();
      clickMarkerRef.current = null;
    }

    routePolylinesRef.current = [];

    // Fonction pour centrer la carte sur un point avec un marqueur
    const centerOnPoint = async (lat: number, lng: number, placeName: string, zoom: number = 16) => {
      // Vérifier que le point est dans les limites du Cameroun
      if (!CAMEROON_BOUNDS.contains([lat, lng])) {
        console.warn('Le point est en dehors des limites du Cameroun');
        return;
      }
      
      let displayName = placeName;
      if (placeName === 'Votre position') {
        const closestPlace = await apiClient.findClosestPlace(lat, lng);
        displayName = closestPlace?.name || placeName;
      }
      
      // Supprimer l'ancien marqueur s'il existe
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      
      mapRef.current!.setView([lat, lng], zoom, { animate: true });
      markerRef.current = L.marker([lat, lng])
        .addTo(mapRef.current!)
        .bindPopup(`<b>${displayName}</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
        .openPopup();
    };

    if (routes && routes.length > 0) {
      // Gérer les itinéraires
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
        // Ajuster la vue pour montrer l'itinéraire, mais dans les limites du Cameroun
        const routeBounds = L.latLngBounds(allCoordinates);
        const paddedBounds = routeBounds.pad(0.1); // Ajouter un peu de marge
        
        // S'assurer que les bounds ajustées sont dans les limites du Cameroun
        const finalBounds = L.latLngBounds(
          [
            Math.max(paddedBounds.getSouth(), CAMEROON_BOUNDS.getSouth()),
            Math.max(paddedBounds.getWest(), CAMEROON_BOUNDS.getWest())
          ],
          [
            Math.min(paddedBounds.getNorth(), CAMEROON_BOUNDS.getNorth()),
            Math.min(paddedBounds.getEast(), CAMEROON_BOUNDS.getEast())
          ]
        );
        
        mapRef.current!.fitBounds(finalBounds);
      }
    } else if (searchedPlace && searchedPlace.coordinates) {
      centerOnPoint(searchedPlace.coordinates.lat, searchedPlace.coordinates.lng, searchedPlace.name);
    } else if (userLocation) {
      centerOnPoint(userLocation.latitude, userLocation.longitude, 'Votre position');
    } else {
      // Retour à la vue par défaut du Cameroun
      mapRef.current!.setView([5.5, 12.0], 6, { animate: true });
      mapRef.current!.setMaxBounds(CAMEROON_BOUNDS);
    }
  }, [apiClient, userLocation, searchedPlace, routes, selectedRouteIndex, setSelectedRouteIndex]);

  return <div className="w-full h-screen" ref={mapContainerRef} />;
};

export default MapView;