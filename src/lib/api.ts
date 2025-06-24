import { Place, Route, GeolocationResult } from './type';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async searchPlaces(name: string): Promise<Place[]> {
    const response = await fetch(`${this.baseUrl}/api/places?name=${encodeURIComponent(name)}`);
    const data = await response.json();
    if (response.ok && data.success) {
      return data.data.filter((place: Place) => place.coordinates !== null);
    }
    throw new Error(data.error || 'Failed to search places');
  }

  async findClosestPlace(lat: number, lng: number): Promise<Place | null> {
    const response = await fetch(`${this.baseUrl}/api/places/closest?lat=${lat}&lng=${lng}`);
    const data = await response.json();
    if (response.ok && data.success) {
      return data.data;
    }
    return null;
  }

  async calculateRoute(
    points: { lat: number; lng: number }[],
    mode: 'driving' | 'walking' | 'cycling',
    startPlaceName: string,
    endPlaceName: string
  ): Promise<Route[]> {
    const response = await fetch(`${this.baseUrl}/api/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points, mode, startPlaceName, endPlaceName }),
    });
    const data = await response.json();
    if (response.ok && data.routes) {
      return data.routes;
    }
    throw new Error(data.error || 'Failed to calculate route');
  }

  async calculateRouteWithDetour(
    start: { lat: number; lng: number },
    detour: { lat: number; lng: number },
    end: { lat: number; lng: number },
    mode: string,
    startPlaceName: string,
    detourPlaceName: string,
    endPlaceName: string
  ): Promise<Route[]> {
    const response = await fetch(`${this.baseUrl}/api/routes/with-detour`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start,
        detour,
        end,
        transportMode: mode,
        startPlaceName,
        detourPlaceName,
        endPlaceName,
      }),
    });
    const data = await response.json();
    if (response.ok && data.routes) {
      return data.routes;
    }
    throw new Error(data.error || 'Failed to calculate route with detour');
  }
}