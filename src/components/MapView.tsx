import React, { useEffect, useRef, useState } from 'react';
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
  const [ipLocation, setIpLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fonction pour obtenir la localisation par IP
  const getLocationByIP = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur de géolocalisation par IP:', error);
      return null;
    }
  };

  // Fonction pour obtenir la localisation par le navigateur
  const getBrowserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Effet pour la géolocalisation au démarrage
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        // Essayer d'abord la géolocalisation du navigateur
        const browserLocation = await getBrowserLocation();
        setIpLocation(browserLocation);
      } catch (browserError) {
        console.log('Géolocalisation navigateur échouée, tentative par IP...', browserError);
        
        // Fallback sur la géolocalisation par IP
        const ipLocation = await getLocationByIP();
        if (ipLocation) {
          setIpLocation(ipLocation);
        } else {
          // Fallback final sur une position par défaut (centre du monde)
          setIpLocation({ lat: 20, lng: 0 });
        }
      }
    };

    initializeLocation();
  }, []);

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
      // Position par défaut centrée sur le monde, sera mise à jour par la géolocalisation
      const defaultCenter = ipLocation || { lat: 20, lng: 0 };
      
      mapRef.current = L.map(mapContainerRef.current, {
        center: [defaultCenter.lat, defaultCenter.lng],
        zoom: 12,
        minZoom: 2, // Zoom minimal réduit pour voir le monde entier
        maxZoom: 18, // Zoom maximal augmenté pour plus de détails
        // Suppression des limites de la carte
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
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

    // Mettre à jour le centre de la carte quand la localisation par IP est disponible
    if (mapRef.current && ipLocation && !userLocation && !searchedPlace && !routes) {
      mapRef.current.setView([ipLocation.lat, ipLocation.lng], 12, { animate: true });
      
      // Ajouter un marqueur pour la position détectée
      if (!markerRef.current) {
        markerRef.current = L.marker([ipLocation.lat, ipLocation.lng])
          .addTo(mapRef.current)
          .bindPopup(`<b>Votre position approximative</b><br>Détectée par IP<br>Lat: ${ipLocation.lat.toFixed(6)}<br>Lng: ${ipLocation.lng.toFixed(6)}`)
          .openPopup();
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [apiClient, ipLocation]);

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
    } else if (ipLocation) {
      // Centrer sur la position IP si aucune autre position n'est disponible
      centerOnPoint(ipLocation.lat, ipLocation.lng, 'Votre position approximative', 12);
    } else {
      // Position de fallback centrée sur le monde
      mapRef.current!.setView([20, 0], 2, { animate: true });
    }
  }, [apiClient, userLocation, searchedPlace, routes, selectedRouteIndex, setSelectedRouteIndex, ipLocation]);

  return <div className="w-full h-screen" ref={mapContainerRef} />;
};

export default MapView;