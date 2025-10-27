/**
 * User preferences management with localStorage persistence
 */

import { UserPrefs } from "./types";
import { STORAGE_KEYS, DEFAULT_PREFS } from "./config";

export class PrefsManager {
  private static instance: PrefsManager;
  private prefs: UserPrefs;

  private constructor() {
    this.prefs = this.loadPrefs();
  }

  static getInstance(): PrefsManager {
    if (!PrefsManager.instance) {
      PrefsManager.instance = new PrefsManager();
    }
    return PrefsManager.instance;
  }

  private loadPrefs(): UserPrefs {
    if (typeof window === "undefined") {
      return DEFAULT_PREFS;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFS, ...parsed };
      }
    } catch (error) {
      console.warn("Failed to load preferences:", error);
    }

    return DEFAULT_PREFS;
  }

  getPrefs(): UserPrefs {
    return { ...this.prefs };
  }

  updatePrefs(updates: Partial<UserPrefs>): void {
    this.prefs = { ...this.prefs, ...updates };
    this.savePrefs();
  }

  private savePrefs(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(this.prefs));
    } catch (error) {
      console.warn("Failed to save preferences:", error);
    }
  }

  reset(): void {
    this.prefs = DEFAULT_PREFS;
    this.savePrefs();
  }

  // Specific preference getters/setters
  getLanguage(): string {
    return this.prefs.language;
  }

  setLanguage(language: string): void {
    this.updatePrefs({ language });
  }

  getTheme(): "light" | "dark" | "auto" {
    return this.prefs.theme;
  }

  setTheme(theme: "light" | "dark" | "auto"): void {
    this.updatePrefs({ theme });
  }

  getLastCity(): UserPrefs["lastCity"] {
    return this.prefs.lastCity;
  }

  setLastCity(city: UserPrefs["lastCity"]): void {
    this.updatePrefs({ lastCity: city });
  }

  getLastDateISO(): string | null {
    return this.prefs.lastDateISO;
  }

  setLastDateISO(dateISO: string | null): void {
    this.updatePrefs({ lastDateISO: dateISO });
  }

  isGeolocationEnabled(): boolean {
    return this.prefs.geolocationEnabled;
  }

  setGeolocationEnabled(enabled: boolean): void {
    this.updatePrefs({ geolocationEnabled: enabled });
  }

  getMapView(): UserPrefs["mapView"] {
    return this.prefs.mapView;
  }

  setMapView(mapView: UserPrefs["mapView"]): void {
    this.updatePrefs({ mapView });
  }
}

// Convenience functions
export const prefsManager = PrefsManager.getInstance();

export const getPrefs = () => prefsManager.getPrefs();
export const updatePrefs = (updates: Partial<UserPrefs>) =>
  prefsManager.updatePrefs(updates);
export const resetPrefs = () => prefsManager.reset();
