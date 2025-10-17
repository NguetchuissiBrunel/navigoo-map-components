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
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylinesRef = useRef<L.Polyline[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // ✅ Bornes élargies du Cameroun
  const CAMEROON_BOUNDS = L.latLngBounds(
    [1.0, 7.8],   // Sud-Ouest
    [13.5, 16.5]  // Nord-Est
  );

  // 🔍 Fonction pour parser les géométries WKT
  const parseWKTLineString = (wkt: string): [number, number][] => {
    try {
      const geo = parse(wkt);
      if (geo && geo.type === 'LineString' && Array.isArray(geo.coordinates)) {
        return geo.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
      }
    } catch (error) {
      console.error('Erreur de parsing WKT:', error);
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

  // 🌍 Initialisation de la carte
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const maxZoom = 18;

      mapRef.current = L.map(mapContainerRef.current, {
        center: [7.3697, 12.3547], // Centre du Cameroun
        zoom: 6,
        minZoom: 5,
        maxZoom,
        maxBounds: CAMEROON_BOUNDS,
        maxBoundsViscosity: 0.8
      });

      // 🗺 Couche OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom,
      }).addTo(mapRef.current);

      // 🧭 Icônes par défaut
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      routeLayerRef.current = L.layerGroup().addTo(mapRef.current);

      // ✅ Recentrage automatique après affichage
      setTimeout(() => {
        mapRef.current?.invalidateSize();
        mapRef.current?.fitBounds(CAMEROON_BOUNDS, { animate: true, padding: [20, 20] });
      }, 300);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // 🚗 Affichage des itinéraires, lieux recherchés et position utilisateur
  useEffect(() => {
    if (!mapRef.current) return;

    // Nettoyage avant rendu
    routeLayerRef.current?.clearLayers();
    routePolylinesRef.current = [];
    
    // Nettoyer les anciens marqueurs
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // ✅ PRIORITÉ 1 : Affichage des itinéraires
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
          const weight = index === selectedRouteIndex ? 5 : 3;
          const opacity = index === selectedRouteIndex ? 1.0 : 0.5;

          const polyline = L.polyline(coordinates, { color, weight, opacity })
            .addTo(routeLayerRef.current!)
            .on('click', (e: L.LeafletMouseEvent) => {
              L.DomEvent.stopPropagation(e);
              setSelectedRouteIndex(index);
              
              // Mettre à jour les styles de toutes les polylines
              routePolylinesRef.current.forEach((pl, i) => {
                pl.setStyle({
                  color: i === index ? 'green' : 'black',
                  weight: i === index ? 5 : 3,
                  opacity: i === index ? 1.0 : 0.5,
                });
              });

              // Afficher un popup au centre de la route
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
          allCoordinates.push(...coordinates);

          // Ajouter des marqueurs de départ et d'arrivée pour la route sélectionnée
          if (index === selectedRouteIndex) {
            const startPoint = coordinates[0];
            const endPoint = coordinates[coordinates.length - 1];

            // Marqueur de départ
            L.marker(startPoint, { 
              icon: L.icon({ 
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              }) 
            })
              .addTo(routeLayerRef.current!)
              .bindPopup(`
                <b>${route.startPlaceName || 'Départ'}</b><br>
                Lat: ${startPoint[0].toFixed(6)}<br>
                Lng: ${startPoint[1].toFixed(6)}
              `);

            // Marqueur d'arrivée
            L.marker(endPoint, { 
              icon: L.icon({ 
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              }) 
            })
              .addTo(routeLayerRef.current!)
              .bindPopup(`
                <b>${route.endPlaceName || 'Destination'}</b><br>
                Lat: ${endPoint[0].toFixed(6)}<br>
                Lng: ${endPoint[1].toFixed(6)}
              `);
          }
        }
      });

      // 🗺 Ajustement de la vue sur l'itinéraire
      if (allCoordinates.length > 0) {
        const routeBounds = L.latLngBounds(allCoordinates);
        mapRef.current.fitBounds(routeBounds, { padding: [50, 50], animate: true });
      }
    } 
    // ✅ PRIORITÉ 2 : Affichage du lieu recherché (seulement s'il n'y a pas de routes)
    else if (searchedPlace && searchedPlace.coordinates) {
      const { lat, lng } = searchedPlace.coordinates;
      
      searchMarkerRef.current = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      })
        .addTo(mapRef.current!)
        .bindPopup(`
          <b>${searchedPlace.name}</b><br>
          Lat: ${lat.toFixed(6)}<br>
          Lng: ${lng.toFixed(6)}
        `)
        .openPopup();

      mapRef.current.setView([lat, lng], 14, { animate: true });
    } 
    // ✅ PRIORITÉ 3 : Affichage de la position utilisateur (seulement s'il n'y a ni routes ni lieu recherché)
    else if (userLocation) {
      const { latitude, longitude } = userLocation;
      
      userMarkerRef.current = L.marker([latitude, longitude], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      })
        .addTo(mapRef.current!)
        .bindPopup(`
          <b>Votre position</b><br>
          Lat: ${latitude.toFixed(6)}<br>
          Lng: ${longitude.toFixed(6)}
        `)
        .openPopup();

      mapRef.current.setView([latitude, longitude], 14, { animate: true });
    } 
    // ✅ PRIORITÉ 4 : Recentrage sur le Cameroun par défaut
    else {
      mapRef.current.fitBounds(CAMEROON_BOUNDS, { animate: true, padding: [20, 20] });
    }
  }, [routes, selectedRouteIndex, searchedPlace, userLocation, setSelectedRouteIndex]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-screen rounded-xl overflow-hidden shadow-md"
    />
  );
};

export default MapView;