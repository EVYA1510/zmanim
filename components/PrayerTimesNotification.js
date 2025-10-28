import React, { useState, useEffect } from "react";

const PrayerTimesNotification = ({
  prayerTimes,
  previousPrayerTimes,
  translations = {},
  className = "",
  currentLocation, // Add current location to detect location changes
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [changes, setChanges] = useState([]);
  const [previousLocation, setPreviousLocation] = useState(null);

  // Detect changes when prayer times change
  useEffect(() => {
    if (!prayerTimes) return;

    // Show notification when prayer times are first loaded
    if (!previousPrayerTimes && Object.keys(prayerTimes).length > 0) {
      setIsVisible(true);
      setChanges([{ name: "זמנים חדשים", oldTime: "", newTime: "" }]);

      // Auto-hide after 5 seconds for first load
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return;
    }

    // Check for location changes
    if (currentLocation && previousLocation) {
      const locationChanged =
        currentLocation.lat !== previousLocation.lat ||
        currentLocation.lng !== previousLocation.lng ||
        currentLocation.name !== previousLocation.name;

      if (locationChanged) {
        setIsVisible(true);
        setChanges([
          {
            name: "שינוי מיקום",
            oldTime: previousLocation.name,
            newTime: currentLocation.name,
          },
        ]);

        // Auto-hide after 8 seconds for location changes
        setTimeout(() => {
          setIsVisible(false);
        }, 8000);
        return;
      }
    }

    const newChanges = [];
    const prayerNames = {
      alot: "עלות השחר",
      misheyakir: "משיאיר",
      sunrise: "נץ החמה",
      sofZmanShma: "סוף זמן קריאת שמע",
      sofZmanTfilla: "סוף זמן תפילה",
      chatzot: "חצות",
      minchaGedola: "מנחה גדולה",
      minchaKetana: "מנחה קטנה",
      plagHamincha: "פלג המנחה",
      sunset: "שקיעת החמה",
      tzeit: "צאת הכוכבים",
    };

    // Check each prayer time for changes
    Object.keys(prayerNames).forEach((key) => {
      if (prayerTimes[key] && previousPrayerTimes[key]) {
        const oldTime = new Date(previousPrayerTimes[key]);
        const newTime = new Date(prayerTimes[key]);

        // Check if time changed by more than 1 minute
        const timeDiff = Math.abs(newTime.getTime() - oldTime.getTime());
        if (timeDiff > 60000) {
          // More than 1 minute difference
          newChanges.push({
            name: prayerNames[key],
            oldTime: oldTime.toLocaleTimeString("he-IL", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            newTime: newTime.toLocaleTimeString("he-IL", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
      }
    });

    if (newChanges.length > 0) {
      setChanges(newChanges);
      setIsVisible(true);

      // Auto-hide after 10 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    }
  }, [prayerTimes, previousPrayerTimes, currentLocation, previousLocation]);

  // Update previous location when current location changes
  useEffect(() => {
    if (currentLocation) {
      setPreviousLocation(currentLocation);
    }
  }, [currentLocation]);

  // Find the next prayer time
  const getNextPrayerTime = () => {
    if (!prayerTimes) return null;

    const now = new Date();
    const prayerTimesList = [
      { key: "alot", name: "עלות השחר", time: prayerTimes.alot },
      { key: "misheyakir", name: "משיאיר", time: prayerTimes.misheyakir },
      { key: "sunrise", name: "נץ החמה", time: prayerTimes.sunrise },
      {
        key: "sofZmanShma",
        name: "סוף זמן קריאת שמע",
        time: prayerTimes.sofZmanShma,
      },
      {
        key: "sofZmanTfilla",
        name: "סוף זמן תפילה",
        time: prayerTimes.sofZmanTfilla,
      },
      { key: "chatzot", name: "חצות", time: prayerTimes.chatzot },
      {
        key: "minchaGedola",
        name: "מנחה גדולה",
        time: prayerTimes.minchaGedola,
      },
      {
        key: "minchaKetana",
        name: "מנחה קטנה",
        time: prayerTimes.minchaKetana,
      },
      {
        key: "plagHamincha",
        name: "פלג המנחה",
        time: prayerTimes.plagHamincha,
      },
      { key: "sunset", name: "שקיעת החמה", time: prayerTimes.sunset },
      { key: "tzeit", name: "צאת הכוכבים", time: prayerTimes.tzeit },
    ];

    // Find the next prayer time
    const nextPrayer = prayerTimesList.find((prayer) => {
      const prayerTime = new Date(prayer.time);
      return prayerTime > now;
    });

    return nextPrayer;
  };

  const scrollToPrayerTimes = () => {
    const prayerSection = document.querySelector("[data-prayer-times]");
    if (prayerSection) {
      prayerSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsVisible(false);
  };

  if (!isVisible || changes.length === 0) return null;

  const nextPrayer = getNextPrayerTime();

  return (
    <div
      className={`fixed top-16 left-2 right-2 sm:top-20 sm:right-4 sm:left-auto z-50 max-w-xs sm:max-w-sm mx-auto sm:mx-0 ${className}`}
    >
      <div className="bg-white dark:bg-gray-800 border border-idf-gold-300 dark:border-idf-gold-600 rounded-lg shadow-lg animate-slide-down">
        <div className="p-2 sm:p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-1 sm:mb-3">
            <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
              <div className="w-5 h-5 sm:w-8 sm:h-8 bg-idf-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs sm:text-sm">🕐</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-idf-gold-800 dark:text-idf-gold-200 truncate">
                  {translations.prayerTimesUpdated || "זמני התפילה עודכנו!"}
                </h4>
                <p className="text-xs text-idf-gold-700 dark:text-idf-gold-300 truncate">
                  {translations.newTimesAvailable || "זמנים חדשים זמינים"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-idf-gold-400 hover:text-idf-gold-600 dark:text-idf-gold-300 dark:hover:text-idf-gold-100 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Changes Summary */}
          <div className="mb-1 sm:mb-3">
            <div className="text-center py-1 sm:py-2">
              <p className="text-xs text-idf-gold-600 dark:text-idf-gold-400">
                {changes.length} שינויים בזמנים
              </p>
            </div>
          </div>

          {/* Next Prayer Time */}
          {nextPrayer && (
            <div className="mb-1 sm:mb-3 p-2 bg-idf-gold-50 dark:bg-idf-gold-900 rounded-lg">
              <p className="text-xs text-idf-gold-700 dark:text-idf-gold-300 text-center">
                <span className="font-semibold">התפילה הבאה:</span>{" "}
                {nextPrayer.name}
              </p>
              <p className="text-xs text-idf-gold-600 dark:text-idf-gold-400 text-center">
                {new Date(nextPrayer.time).toLocaleTimeString("he-IL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
            <button
              onClick={scrollToPrayerTimes}
              className="flex-1 bg-idf-gold-600 hover:bg-idf-gold-700 text-white text-xs py-1.5 px-2 sm:py-2 sm:px-3 rounded transition-colors duration-200"
            >
              {translations.viewTimes || "צפה בזמנים"}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-xs py-1.5 px-2 sm:py-2 sm:px-3 border border-idf-gold-300 dark:border-idf-gold-600 text-idf-gold-700 dark:text-idf-gold-300 rounded hover:bg-idf-gold-50 dark:hover:bg-idf-gold-800 transition-colors duration-200"
            >
              {translations.later || "מאוחר יותר"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesNotification;
