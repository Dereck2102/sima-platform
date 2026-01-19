/**
 * Geo Location Service for SIMA Mobile
 * Provides GPS location capture functionality
 */

// Types
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeoError {
  code: number;
  message: string;
}

// Web Geolocation API wrapper
export const GeoService = {
  /**
   * Check if geolocation is available
   */
  isAvailable: (): boolean => {
    return 'geolocation' in navigator;
  },

  /**
   * Get current position
   * Returns a promise with coordinates or error
   */
  getCurrentPosition: (): Promise<GeoCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!GeoService.isAvailable()) {
        reject({ code: 0, message: 'Geolocation is not supported by this browser' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let message = 'Unknown error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission denied. Please allow location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          reject({ code: error.code, message });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache location for 1 minute
        }
      );
    });
  },

  /**
   * Format coordinates for display
   */
  formatCoordinates: (lat: number, lng: number): string => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
  },
};
