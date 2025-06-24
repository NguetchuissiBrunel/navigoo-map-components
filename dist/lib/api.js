"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
class ApiClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async searchPlaces(name) {
        const response = await fetch(`${this.baseUrl}/api/places?name=${encodeURIComponent(name)}`);
        const data = await response.json();
        if (response.ok && data.success) {
            return data.data.filter((place) => place.coordinates !== null);
        }
        throw new Error(data.error || 'Failed to search places');
    }
    async findClosestPlace(lat, lng) {
        const response = await fetch(`${this.baseUrl}/api/places/closest?lat=${lat}&lng=${lng}`);
        const data = await response.json();
        if (response.ok && data.success) {
            return data.data;
        }
        return null;
    }
    async calculateRoute(points, mode, startPlaceName, endPlaceName) {
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
    async calculateRouteWithDetour(start, detour, end, mode, startPlaceName, detourPlaceName, endPlaceName) {
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
exports.ApiClient = ApiClient;
