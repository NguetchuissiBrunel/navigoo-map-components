"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentPosition = void 0;
const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject({
                code: -1,
                message: 'Geolocation is not supported by this browser.',
            });
            return;
        }
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        }, (error) => {
            reject({
                code: error.code,
                message: error.message,
            });
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
    });
};
exports.getCurrentPosition = getCurrentPosition;
