/**
 * Boot system types for initial application state
 */

export interface BootConfig {
  /** Default language code */
  defaultLanguage: string;
  /** Default city coordinates */
  defaultCity: {
    lat: number;
    lng: number;
    name: string;
  };
  /** Whether to attempt geolocation on boot */
  enableGeolocation: boolean;
  /** Geolocation timeout in milliseconds */
  geolocationTimeout: number;
  /** Whether to persist user preferences */
  persistPrefs: boolean;
  /** Storage key prefix */
  storagePrefix: string;
}

export interface UserPrefs {
  /** Selected language code */
  language: string;
  /** Theme preference */
  theme: "light" | "dark" | "auto";
  /** Last selected city */
  lastCity: {
    lat: number;
    lng: number;
    name: string;
  } | null;
  /** Last selected date as ISO string */
  lastDateISO: string | null;
  /** Whether geolocation is enabled */
  geolocationEnabled: boolean;
  /** Map view state */
  mapView: {
    center: [number, number];
    zoom: number;
  } | null;
}

export interface GeolocationResult {
  /** Whether geolocation was successful */
  success: boolean;
  /** Coordinates if successful */
  coordinates?: {
    lat: number;
    lng: number;
  };
  /** Error message if failed */
  error?: string;
  /** Whether user denied permission */
  denied?: boolean;
}

export interface BootState {
  /** Whether boot process is complete */
  isReady: boolean;
  /** Whether geolocation is in progress */
  isGeolocating: boolean;
  /** Current user preferences */
  prefs: UserPrefs;
  /** Geolocation result */
  geolocation: GeolocationResult | null;
  /** Whether to show location CTA */
  showLocationCTA: boolean;
}

export interface BootActions {
  /** Update user preferences */
  updatePrefs: (prefs: Partial<UserPrefs>) => void;
  /** Enable geolocation */
  enableGeolocation: () => Promise<void>;
  /** Dismiss location CTA */
  dismissLocationCTA: () => void;
  /** Reset to defaults */
  reset: () => void;
}

export type BootHookReturn = BootState & BootActions;

// Israel-specific constants
export const ISRAEL_BOUNDS: [[number, number], [number, number]] = [
  [29.4, 34.2], // Southwest corner
  [33.5, 35.9], // Northeast corner
];

export const ISRAEL_CENTER: [number, number] = [32.08, 34.78]; // Tel Aviv area

export const DEFAULT_CITIES = {
  JERUSALEM: { lat: 31.7683, lng: -35.2137, name: "ירושלים, ישראל" },
  TEL_AVIV: { lat: 32.0853, lng: -34.7818, name: "תל אביב, ישראל" },
  HAIFA: { lat: 32.794, lng: -34.9896, name: "חיפה, ישראל" },
} as const;
