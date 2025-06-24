export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string | number;
  name: string;
  coordinates: Coordinates | null;
}

export interface RouteStep {
  geometry: string;
  source: string;
  target: string;
  distance: number;
  duration: number;
}

export interface Route {
  distance: number;
  duration: number;
  steps: RouteStep[];
  startPlaceName?: string;
  endPlaceName?: string;
  geometry: string;
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}