/**
 * Prayer Times Notification System
 * Encourages users to view updated prayer times
 */

import React, { useState, useEffect } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";

const PrayerTimesNotification = ({
  prayerTimes,
  previousPrayerTimes,
  onDismiss,
  translations = {},
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes in prayer times
  useEffect(() => {
    if (prayerTimes && previousPrayerTimes) {
      const changes = detectPrayerTimeChanges(prayerTimes, previousPrayerTimes);
      if (changes.length > 0) {
        setHasChanges(true);
        setIsVisible(true);

        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [prayerTimes, previousPrayerTimes]);

  const detectPrayerTimeChanges = (current, previous) => {
    const changes = [];
    const prayerKeys = [
      "alotHaShachar",
      "misheyakirMachmir",
      "misheyakirAchil",
      "sunrise",
      "sofZmanShma",
      "sofZmanTfilla",
      "chatzot",
      "minchaGedola",
      "minchaKetana",
      "plagHamincha",
      "sunset",
      "tzeitHakochavim",
      "tzeit42",
      "tzeit72",
      "kenisatShabbat18",
      "kenisatShabbat20",
      "kenisatShabbat40",
      "yetziatShabbat",
    ];

    prayerKeys.forEach((key) => {
      if (current[key] && previous[key] && current[key] !== previous[key]) {
        changes.push({
          prayer: key,
          oldTime: previous[key],
          newTime: current[key],
          name: getPrayerName(key, translations),
        });
      }
    });

    return changes;
  };

  const getPrayerName = (key, translations) => {
    const prayerNames = {
      alotHaShachar: translations.alotHaShachar || "עלות השחר",
      misheyakirMachmir: translations.misheyakirMachmir || "משיאיר (מחמיר)",
      misheyakirAchil: translations.misheyakirAchil || "משיאיר (אכיל)",
      sunrise: translations.sunrise || "זריחה",
      sofZmanShma: translations.sofZmanShma || "סוף זמן קריאת שמע",
      sofZmanTfilla: translations.sofZmanTfilla || "סוף זמן תפילה",
      chatzot: translations.chatzot || "חצות",
      minchaGedola: translations.minchaGedola || "מנחה גדולה",
      minchaKetana: translations.minchaKetana || "מנחה קטנה",
      plagHamincha: translations.plagHamincha || "פלג המנחה",
      sunset: translations.sunset || "שקיעה",
      tzeitHakochavim: translations.tzeitHakochavim || "צאת הכוכבים",
      tzeit42: translations.tzeit42 || "צאת הכוכבים (42 דק')",
      tzeit72: translations.tzeit72 || "צאת הכוכבים (72 דק')",
      kenisatShabbat18: translations.kenisatShabbat18 || "כניסת שבת (18 דק')",
      kenisatShabbat20: translations.kenisatShabbat20 || "כניסת שבת (20 דק')",
      kenisatShabbat40: translations.kenisatShabbat40 || "כניסת שבת (40 דק')",
      yetziatShabbat: translations.yetziatShabbat || "יציאת שבת",
    };

    return prayerNames[key] || key;
  };

  if (!isVisible || !hasChanges) return null;

  const changes = detectPrayerTimeChanges(prayerTimes, previousPrayerTimes);

  return (
    <div className={`fixed top-20 right-4 z-50 max-w-sm ${className}`}>
      <Card
        variant="glass-gold"
        className="animate-slide-up shadow-glass-gold-lg border-2 border-idf-gold-300"
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-idf-gold-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🕐</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-idf-gold-800">
                  {translations.prayerTimesUpdated || "זמני התפילה עודכנו!"}
                </h4>
                <p className="text-xs text-idf-gold-700">
                  {translations.newTimesAvailable || "זמנים חדשים זמינים"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                setIsVisible(false);
                onDismiss?.();
              }}
              className="text-idf-gold-600 hover:text-idf-gold-800"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-2 mb-3">
            {changes.slice(0, 3).map((change, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-idf-gold-700 font-medium">
                  {change.name}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-500 dark:text-gray-400 line-through">
                    {change.oldTime}
                  </span>
                  <span className="text-idf-gold-600">→</span>
                  <span className="text-idf-gold-800 font-bold">
                    {change.newTime}
                  </span>
                </div>
              </div>
            ))}
            {changes.length > 3 && (
              <div className="text-xs text-idf-gold-600 text-center">
                +{changes.length - 3}{" "}
                {translations.moreChanges || "עוד שינויים"}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="small"
              onClick={() => {
                // Scroll to prayer times section
                const prayerSection = document.querySelector(
                  "[data-prayer-times]"
                );
                if (prayerSection) {
                  prayerSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
                setIsVisible(false);
              }}
              className="flex-1 bg-idf-gold-600 hover:bg-idf-gold-700 text-white text-xs py-2"
            >
              {translations.viewTimes || "צפה בזמנים"}
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={() => setIsVisible(false)}
              className="text-xs py-2 border-idf-gold-300 text-idf-gold-700"
            >
              {translations.later || "מאוחר יותר"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrayerTimesNotification;
