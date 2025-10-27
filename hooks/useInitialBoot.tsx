/**
 * Initial boot hook for application state management
 */

import { useState, useEffect, useCallback } from "react";
import {
  BootHookReturn,
  BootState,
  GeolocationResult,
} from "../lib/boot/types";
import { prefsManager } from "../lib/boot/prefs";
import { geolocationService } from "../lib/boot/geo";
import { BOOT_CONFIG } from "../lib/boot/config";

export function useInitialBoot(): BootHookReturn {
  const [bootState, setBootState] = useState<BootState>({
    isReady: false,
    isGeolocating: false,
    prefs: prefsManager.getPrefs(),
    geolocation: null,
    showLocationCTA: false,
  });

  // Initialize boot process
  useEffect(() => {
    const initializeBoot = async () => {
      try {
        // Load preferences
        const prefs = prefsManager.getPrefs();

        // Set initial state
        setBootState((prev) => ({
          ...prev,
          prefs,
          isReady: true,
        }));

        // Attempt geolocation if enabled and not previously denied
        if (BOOT_CONFIG.enableGeolocation && !prefs.geolocationEnabled) {
          const permission = await geolocationService.checkPermission();

          if (permission === "granted") {
            await attemptGeolocation();
          } else if (permission === "prompt") {
            // Show CTA after a delay to not be intrusive
            setTimeout(() => {
              setBootState((prev) => ({
                ...prev,
                showLocationCTA: true,
              }));
            }, 2000);
          }
        }
      } catch (error) {
        console.warn("Boot initialization failed:", error);
        setBootState((prev) => ({
          ...prev,
          isReady: true,
        }));
      }
    };

    initializeBoot();
  }, []);

  const attemptGeolocation = useCallback(async () => {
    setBootState((prev) => ({
      ...prev,
      isGeolocating: true,
      showLocationCTA: false,
    }));

    try {
      const result = await geolocationService.getCurrentPosition();

      setBootState((prev) => ({
        ...prev,
        geolocation: result,
        isGeolocating: false,
      }));

      if (result.success && result.coordinates) {
        // Update preferences with successful geolocation
        prefsManager.setGeolocationEnabled(true);
        prefsManager.setLastCity({
          lat: result.coordinates.lat,
          lng: result.coordinates.lng,
          name: `${result.coordinates.lat.toFixed(
            4
          )}, ${result.coordinates.lng.toFixed(4)}`,
        });
      }
    } catch (error) {
      setBootState((prev) => ({
        ...prev,
        geolocation: {
          success: false,
          error: "Geolocation failed",
        },
        isGeolocating: false,
      }));
    }
  }, []);

  const updatePrefs = useCallback(
    (updates: Partial<typeof bootState.prefs>) => {
      prefsManager.updatePrefs(updates);
      setBootState((prev) => ({
        ...prev,
        prefs: { ...prev.prefs, ...updates },
      }));
    },
    []
  );

  const enableGeolocation = useCallback(async () => {
    await attemptGeolocation();
  }, [attemptGeolocation]);

  const dismissLocationCTA = useCallback(() => {
    setBootState((prev) => ({
      ...prev,
      showLocationCTA: false,
    }));

    // Mark as dismissed for this session
    prefsManager.setGeolocationEnabled(false);
  }, []);

  const reset = useCallback(() => {
    prefsManager.reset();
    setBootState({
      isReady: true,
      isGeolocating: false,
      prefs: prefsManager.getPrefs(),
      geolocation: null,
      showLocationCTA: false,
    });
  }, []);

  return {
    ...bootState,
    updatePrefs,
    enableGeolocation,
    dismissLocationCTA,
    reset,
  };
}
