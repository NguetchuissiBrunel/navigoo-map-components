export interface GeolocationResult {
    latitude: number;
    longitude: number;
}
export interface GeolocationError {
    code: number;
    message: string;
}
export declare const getCurrentPosition: () => Promise<GeolocationResult>;
