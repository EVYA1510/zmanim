/**
 * Geolocation utilities with reverse geocoding
 */

import { GeolocationResult } from "./types";
import { GEOLOCATION_OPTIONS } from "./config";

export class GeolocationService {
  private static instance: GeolocationService;

  private constructor() {}

  static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  /**
   * Get current position with error handling
   */
  async getCurrentPosition(): Promise<GeolocationResult> {
    if (!navigator.geolocation) {
      return {
        success: false,
        error: "Geolocation is not supported by this browser",
      };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding to get city name
          try {
            const cityName = await this.reverseGeocode(latitude, longitude);
            resolve({
              success: true,
              coordinates: {
                lat: latitude,
                lng: longitude,
              },
            });
          } catch (error) {
            // Still return coordinates even if reverse geocoding fails
            resolve({
              success: true,
              coordinates: {
                lat: latitude,
                lng: longitude,
              },
            });
          }
        },
        (error) => {
          let errorMessage = "Failed to get location";
          let denied = false;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              denied = true;
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
            default:
              errorMessage = "Unknown geolocation error";
              break;
          }

          resolve({
            success: false,
            error: errorMessage,
            denied,
          });
        },
        GEOLOCATION_OPTIONS
      );
    });
  }

  /**
   * Reverse geocoding to get city name
   */
  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=he`
      );

      if (!response.ok) {
        throw new Error("Reverse geocoding failed");
      }

      const data = await response.json();
      const cityName =
        data.locality ||
        data.city ||
        data.principalSubdivision ||
        "Unknown Location";
      const countryName = data.countryName || "Israel";

      return `${cityName}, ${countryName}`;
    } catch (error) {
      console.warn("Reverse geocoding failed:", error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  /**
   * Check if geolocation is available
   */
  isAvailable(): boolean {
    return "geolocation" in navigator;
  }

  /**
   * Check if geolocation permission is granted
   */
  async checkPermission(): Promise<"granted" | "denied" | "prompt"> {
    if (!this.isAvailable()) {
      return "denied";
    }

    try {
      const result = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });
      return result.state;
    } catch (error) {
      // Fallback: try to get position with very short timeout
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve("prompt");
        }, 100);

        navigator.geolocation.getCurrentPosition(
          () => {
            clearTimeout(timeout);
            resolve("granted");
          },
          (error) => {
            clearTimeout(timeout);
            resolve(
              error.code === error.PERMISSION_DENIED ? "denied" : "prompt"
            );
          },
          { timeout: 100, maximumAge: 0 }
        );
      });
    }
  }
}

// Convenience functions
export const geolocationService = GeolocationService.getInstance();

export const getCurrentPosition = () => geolocationService.getCurrentPosition();
export const isGeolocationAvailable = () => geolocationService.isAvailable();
export const checkGeolocationPermission = () =>
  geolocationService.checkPermission();
