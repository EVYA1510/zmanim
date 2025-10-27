/**
 * Boot configuration and constants
 */

import { BootConfig, DEFAULT_CITIES } from "./types";

export const BOOT_CONFIG: BootConfig = {
  defaultLanguage: "he",
  defaultCity: DEFAULT_CITIES.JERUSALEM,
  enableGeolocation: true,
  geolocationTimeout: 10000,
  persistPrefs: true,
  storagePrefix: "idf-zmanim",
};

export const STORAGE_KEYS = {
  PREFS: `${BOOT_CONFIG.storagePrefix}:prefs`,
  MAP_VIEW: `${BOOT_CONFIG.storagePrefix}:map:view`,
  LAST_LOCATION: `${BOOT_CONFIG.storagePrefix}:last:location`,
} as const;

export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: BOOT_CONFIG.geolocationTimeout,
  maximumAge: 300000, // 5 minutes
};

export const DEFAULT_PREFS = {
  language: BOOT_CONFIG.defaultLanguage,
  theme: "auto" as const,
  lastCity: null,
  lastDateISO: null,
  geolocationEnabled: false,
  mapView: null,
};
