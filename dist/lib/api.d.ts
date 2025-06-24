import { Place, Route } from './type';
export declare class ApiClient {
    private baseUrl;
    constructor(baseUrl: string);
    searchPlaces(name: string): Promise<Place[]>;
    findClosestPlace(lat: number, lng: number): Promise<Place | null>;
    calculateRoute(points: {
        lat: number;
        lng: number;
    }[], mode: 'driving' | 'walking' | 'cycling', startPlaceName: string, endPlaceName: string): Promise<Route[]>;
    calculateRouteWithDetour(start: {
        lat: number;
        lng: number;
    }, detour: {
        lat: number;
        lng: number;
    }, end: {
        lat: number;
        lng: number;
    }, mode: string, startPlaceName: string, detourPlaceName: string, endPlaceName: string): Promise<Route[]>;
}
