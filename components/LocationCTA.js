/**
 * Non-intrusive location permission CTA bar
 */

import React from "react";
import Button from "./ui/Button";

const LocationCTA = ({
  onEnable,
  onDismiss,
  isGeolocating = false,
  translations = {},
  className = "",
}) => {
  return (
    <div className={`fixed top-4 left-4 right-4 z-50 ${className}`}>
      <div className="glass-olive rounded-lg p-4 shadow-glass-olive-lg animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-idf-olive-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📍</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-idf-olive-800">
                {translations.locationCTA?.title || "Enable Location Services"}
              </h4>
              <p className="text-xs text-idf-olive-700 mt-1">
                {translations.locationCTA?.description ||
                  "Get accurate prayer times for your current location"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="outline"
              size="small"
              onClick={onDismiss}
              className="text-xs px-3 py-1 border-idf-olive-300 text-idf-olive-700 hover:bg-idf-olive-50"
            >
              {translations.locationCTA?.dismiss || "Later"}
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={onEnable}
              disabled={isGeolocating}
              className="text-xs px-3 py-1 bg-idf-olive-600 hover:bg-idf-olive-700 text-white"
            >
              {isGeolocating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  {translations.locationCTA?.enabling || "Enabling..."}
                </>
              ) : (
                <>
                  <span className="mr-1">📍</span>
                  {translations.locationCTA?.enable || "Enable"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationCTA;
