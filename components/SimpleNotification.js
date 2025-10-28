import React, { useState, useEffect } from "react";

const SimpleNotification = ({ prayerTimes, translations = {} }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (prayerTimes && Object.keys(prayerTimes).length > 0) {
      setIsVisible(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
  }, [prayerTimes]);

  // Find the closest prayer time to current time
  const getClosestPrayerTime = () => {
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
    ].filter((prayer) => prayer.time);

    // Calculate time differences and find the closest
    const timesWithDiff = prayerTimesList.map((prayer) => {
      const prayerTime = new Date(prayer.time);
      const diff = Math.abs(prayerTime.getTime() - now.getTime());
      return { ...prayer, diff, prayerTime };
    });

    // Sort by closest time and return the closest one
    return timesWithDiff.sort((a, b) => a.diff - b.diff)[0];
  };

  // Determine which section contains the closest prayer time
  const getClosestSection = (closestPrayer) => {
    if (!closestPrayer) return "morning";

    const morningPrayers = [
      "alot",
      "misheyakir",
      "sunrise",
      "sofZmanShma",
      "sofZmanTfilla",
    ];
    const dayPrayers = [
      "chatzot",
      "minchaGedola",
      "minchaKetana",
      "plagHamincha",
    ];
    const eveningPrayers = ["sunset", "tzeit"];

    if (morningPrayers.includes(closestPrayer.key)) return "morning";
    if (dayPrayers.includes(closestPrayer.key)) return "day";
    if (eveningPrayers.includes(closestPrayer.key)) return "evening";

    return "morning"; // default
  };

  const handleViewTimes = () => {
    const closestPrayer = getClosestPrayerTime();
    const closestSection = getClosestSection(closestPrayer);

    // Scroll to prayer times section
    const prayerSection = document.querySelector("[data-prayer-times]");
    if (prayerSection) {
      prayerSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // After scrolling, expand the closest section
      setTimeout(() => {
        const sectionElement = document.querySelector(
          `[data-section="${closestSection}"]`
        );
        if (sectionElement) {
          // Find the toggle button and click it to expand the section
          const toggleButton = sectionElement.querySelector(
            'div[class*="cursor-pointer"]'
          );
          if (toggleButton) {
            toggleButton.click();
          }
        }
      }, 500); // Wait for scroll to complete
    }

    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg animate-slide-down">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm">זמני התפילה עודכנו!</h4>
            <p className="text-xs">לחץ לצפייה בזמנים</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 text-lg"
          >
            ×
          </button>
        </div>
        <button
          onClick={handleViewTimes}
          className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded transition-colors"
        >
          צפה בזמנים הקרובים
        </button>
      </div>
    </div>
  );
};

export default SimpleNotification;
