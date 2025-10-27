import React, { useState, useRef, useEffect } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import dynamic from "next/dynamic";

// Import Map component dynamically
const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">טוען מפה...</p>
      </div>
    </div>
  ),
});

const LocationSelector = ({
  onLocationChange,
  currentLocation,
  predefinedCities = [],
  className = "",
  translations = {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [manualCoords, setManualCoords] = useState({
    lat: "",
    lng: "",
    name: "",
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(true); // Changed to true - map open by default
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);

  // Clear messages after delay
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter cities based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = predefinedCities.filter((city) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowResults(true);
    } else {
      setFilteredCities([]);
      setShowResults(false);
    }
  }, [searchTerm, predefinedCities]);

  // Focus search input when search method is selected
  useEffect(() => {
    if (selectedMethod === "search" && inputRef.current) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [selectedMethod]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCitySelect = (city) => {
    onLocationChange({
      lat: city.lat,
      lng: city.lng,
      name: city.name,
    });
    setSearchTerm("");
    setShowResults(false);
    setErrorMessage("");
    setSuccessMessage(`מיקום עודכן בהצלחה: ${city.name}`);
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);

    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");

    if (isNaN(lat) || isNaN(lng)) {
      setErrorMessage("אנא הזן קורדינאטות תקינות (מספרים בלבד)");
      return;
    }

    if (lat < -90 || lat > 90) {
      setErrorMessage("קו הרוחב חייב להיות בין -90 ל-90");
      return;
    }

    if (lng < -180 || lng > 180) {
      setErrorMessage("קו האורך חייב להיות בין -180 ל-180");
      return;
    }

    const locationName =
      manualCoords.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    onLocationChange({
      lat,
      lng,
      name: locationName,
    });

    setSuccessMessage(`מיקום עודכן בהצלחה: ${locationName}`);
    setManualCoords({ lat: "", lng: "", name: "" });
  };

  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage(
        "הדפדפן שלך לא תומך במיקום נוכחי. אנא השתמש בחיפוש עיר או במפה."
      );
      return;
    }

    // Close other methods but keep map open
    setSelectedMethod("");
    // Keep map open - don't close it
    setSearchTerm("");
    setShowResults(false);
    setManualCoords({ lat: "", lng: "", name: "" });
    setErrorMessage("");
    setSuccessMessage("");

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocoding to get city name
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=he`
        )
          .then((response) => response.json())
          .then((data) => {
            const cityName =
              data.locality ||
              data.city ||
              data.principalSubdivision ||
              "מיקום נוכחי";
            const fullName = `${cityName}, ${data.countryName || "ישראל"}`;

            onLocationChange({
              lat: latitude,
              lng: longitude,
              name: fullName,
            });

            setSuccessMessage(`מיקום עודכן בהצלחה: ${fullName}`);
            setIsGettingLocation(false);
          })
          .catch((error) => {
            console.error("Reverse geocoding failed:", error);
            // Fallback if reverse geocoding fails
            const fallbackName = `מיקום נוכחי (${latitude.toFixed(
              4
            )}, ${longitude.toFixed(4)})`;
            onLocationChange({
              lat: latitude,
              lng: longitude,
              name: fallbackName,
            });

            setSuccessMessage(`מיקום עודכן: ${fallbackName}`);
            setIsGettingLocation(false);
          });
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMsg = "שגיאה בקבלת המיקום";
        let suggestion = "";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "הגישה למיקום נדחתה";
            suggestion = "אנא הפעל הרשאות מיקום בדפדפן או השתמש בחיפוש עיר";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "מידע המיקום לא זמין";
            suggestion =
              "ייתכן שהמיקום לא זמין כרגע. נסה להשתמש בחיפוש עיר במקום";
            break;
          case error.TIMEOUT:
            errorMsg = "בקשת המיקום פגה";
            suggestion = "החיבור איטי מדי. נסה שוב או השתמש בחיפוש עיר";
            break;
          default:
            suggestion = "נסה להשתמש בחיפוש עיר במקום";
        }

        setErrorMessage(`${errorMsg}. ${suggestion}`);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Handle map location selection
  const handleMapLocationSelect = (coords) => {
    const { latitude, longitude } = coords;
    const calculationLng = -longitude; // Reverse for calculations

    onLocationChange({
      lat: latitude,
      lng: calculationLng,
      name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    });
  };

  return (
    <Card className={`${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <span className="mr-2">📍</span>
          {translations.locationSelection || "בחירת מיקום"}
        </h3>

        {/* Location Selection Methods */}
        <div className="space-y-3 mb-6">
          {/* Method Selection Buttons - Creative Design */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* City Search Button */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Button
                variant={selectedMethod === "search" ? "primary" : "outline"}
                size="medium"
                onClick={() => {
                  setSelectedMethod("search");
                  setManualCoords({ lat: "", lng: "", name: "" });
                }}
                className="relative w-full py-4 text-sm sm:text-base font-medium border-2 hover:scale-105 transition-all duration-300"
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-xl">🔍</span>
                  <span>{translations.citySearch || "חיפוש עיר"}</span>
                </div>
              </Button>
            </div>

            {/* Manual Coordinates Button */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Button
                variant={selectedMethod === "manual" ? "primary" : "outline"}
                size="medium"
                onClick={() => {
                  setSelectedMethod("manual");
                  setSearchTerm("");
                  setShowResults(false);
                }}
                className="relative w-full py-4 text-sm sm:text-base font-medium border-2 hover:scale-105 transition-all duration-300"
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-xl">📍</span>
                  <span>
                    {translations.manualCoordinates || "קורדינאטות ידני"}
                  </span>
                </div>
              </Button>
            </div>

            {/* Current Location Button */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Button
                variant="secondary"
                size="medium"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="relative w-full py-4 text-sm sm:text-base font-medium border-2 hover:scale-105 transition-all duration-300"
              >
                <div className="flex flex-col items-center space-y-1">
                  {isGettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="text-xs">מקבל מיקום...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🌍</span>
                      <span>
                        {translations.currentLocation || "מיקום נוכחי"}
                      </span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Search Method */}
        {selectedMethod === "search" && (
          <div className="relative" ref={searchRef}>
            <Input
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                translations.citySearchPlaceholder || "הקלד שם עיר..."
              }
              icon="🔍"
              className="w-full"
            />

            {/* Search Results */}
            {showResults && (
              <div
                ref={resultsRef}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {filteredCities.length > 0 ? (
                  filteredCities.slice(0, 10).map((city, index) => (
                    <div
                      key={index}
                      onClick={() => handleCitySelect(city)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {city.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          📍
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    לא נמצאו תוצאות
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manual Coordinates Method */}
        {selectedMethod === "manual" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="קו רוחב (Latitude)"
                type="number"
                step="any"
                min="-90"
                max="90"
                value={manualCoords.lat}
                onChange={(e) =>
                  setManualCoords({ ...manualCoords, lat: e.target.value })
                }
                placeholder="לדוגמה: 31.7683"
              />
              <Input
                label="קו אורך (Longitude)"
                type="number"
                step="any"
                min="-180"
                max="180"
                value={manualCoords.lng}
                onChange={(e) =>
                  setManualCoords({ ...manualCoords, lng: e.target.value })
                }
                placeholder="לדוגמה: 35.2137"
              />
            </div>

            <Input
              label={translations.locationNameLabel || "שם המיקום (אופציונלי)"}
              value={manualCoords.name}
              onChange={(e) =>
                setManualCoords({ ...manualCoords, name: e.target.value })
              }
              placeholder="לדוגמה: הבית שלי"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleManualSubmit}
                disabled={!manualCoords.lat || !manualCoords.lng}
                variant="success"
                className="flex-1 py-2 text-sm sm:text-base"
              >
                ✓ {translations.confirm || "אישור"}
              </Button>
              <Button
                onClick={() => setManualCoords({ lat: "", lng: "", name: "" })}
                variant="danger"
                className="flex-1 py-2 text-sm sm:text-base"
              >
                🗑️ {translations.clear || "נקה"}
              </Button>
            </div>
          </div>
        )}

        {/* Interactive Map - Always Visible */}
        <div className="mt-3">
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">
              🗺️ {translations.interactiveMap || "מפה אינטראקטיבית"}
            </h4>
            <p className="text-xs text-gray-600">
              {translations.clickMapToSelect || "לחץ על המפה כדי לבחור מיקום"}
            </p>
          </div>
          <Map
            onLocationSelect={handleMapLocationSelect}
            initialLat={Math.abs(currentLocation.lat)}
            initialLng={Math.abs(currentLocation.lng)}
          />
        </div>

        {/* Current Location Display */}
        {currentLocation && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <span className="text-sm font-medium text-blue-800">
                {translations.currentLocationLabel || "מיקום נוכחי:"}
              </span>
              <p className="text-blue-600">{currentLocation.name}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-red-700 text-sm">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span className="text-green-700 text-sm">{successMessage}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LocationSelector;
