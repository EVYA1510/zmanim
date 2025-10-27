/**
 * Smart Prayer Reminders Component
 * Provides contextual reminders about prayer times
 */

import React, { useState, useEffect } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";

const SmartPrayerReminders = ({
  prayerTimes,
  currentTime,
  translations = {},
  className = "",
}) => {
  const [currentReminder, setCurrentReminder] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);

  useEffect(() => {
    if (!prayerTimes || !currentTime) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    // Find next prayer time
    const prayers = [
      {
        key: "alotHaShachar",
        name: translations.alotHaShachar || "עלות השחר",
        priority: 1,
      },
      { key: "sunrise", name: translations.sunrise || "זריחה", priority: 2 },
      {
        key: "sofZmanShma",
        name: translations.sofZmanShma || "סוף זמן קריאת שמע",
        priority: 3,
      },
      {
        key: "sofZmanTfilla",
        name: translations.sofZmanTfilla || "סוף זמן תפילה",
        priority: 4,
      },
      { key: "chatzot", name: translations.chatzot || "חצות", priority: 5 },
      {
        key: "minchaGedola",
        name: translations.minchaGedola || "מנחה גדולה",
        priority: 6,
      },
      {
        key: "minchaKetana",
        name: translations.minchaKetana || "מנחה קטנה",
        priority: 7,
      },
      {
        key: "plagHamincha",
        name: translations.plagHamincha || "פלג המנחה",
        priority: 8,
      },
      { key: "sunset", name: translations.sunset || "שקיעה", priority: 9 },
      {
        key: "tzeitHakochavim",
        name: translations.tzeitHakochavim || "צאת הכוכבים",
        priority: 10,
      },
    ];

    // Find next prayer
    let nextPrayerTime = null;
    let nextPrayerName = null;
    let timeUntilNext = null;

    for (const prayer of prayers) {
      const prayerTime = prayerTimes[prayer.key];
      if (prayerTime) {
        const prayerMinutes = timeToMinutes(prayerTime);
        if (prayerMinutes !== null && prayerMinutes > currentTimeMinutes) {
          nextPrayerTime = prayerTime;
          nextPrayerName = prayer.name;
          timeUntilNext = prayerMinutes - currentTimeMinutes;
          break;
        }
      }
    }

    setNextPrayer({
      time: nextPrayerTime,
      name: nextPrayerName,
      minutesUntil: timeUntilNext,
    });

    // Generate contextual reminder
    const reminder = generateContextualReminder(
      currentTimeMinutes,
      nextPrayerName,
      timeUntilNext,
      translations
    );
    setCurrentReminder(reminder);
  }, [prayerTimes, currentTime, translations]);

  const timeToMinutes = (timeStr) => {
    try {
      const [time, period] = timeStr.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let totalMinutes = hours * 60 + minutes;

      if (period === "PM" && hours !== 12) {
        totalMinutes += 12 * 60;
      } else if (period === "AM" && hours === 12) {
        totalMinutes -= 12 * 60;
      }

      return totalMinutes;
    } catch {
      return null;
    }
  };

  const generateContextualReminder = (
    currentMinutes,
    nextPrayerName,
    minutesUntil,
    translations
  ) => {
    if (!nextPrayerName || !minutesUntil) return null;

    const hour = Math.floor(currentMinutes / 60);

    // Morning prayers (4-12)
    if (hour >= 4 && hour < 12) {
      if (minutesUntil <= 30) {
        return {
          type: "urgent",
          icon: "⏰",
          message:
            translations.morningUrgent ||
            `התפילה הבאה: ${nextPrayerName} בעוד ${minutesUntil} דקות`,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      } else {
        return {
          type: "info",
          icon: "🌅",
          message:
            translations.morningInfo ||
            `זמן טוב להתכונן לתפילת ${nextPrayerName}`,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      }
    }

    // Afternoon prayers (12-18)
    if (hour >= 12 && hour < 18) {
      if (minutesUntil <= 15) {
        return {
          type: "urgent",
          icon: "⏰",
          message:
            translations.afternoonUrgent || `מנחה בעוד ${minutesUntil} דקות`,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      } else {
        return {
          type: "info",
          icon: "☀️",
          message: translations.afternoonInfo || "זמן טוב לבדוק את זמני המנחה",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      }
    }

    // Evening prayers (18-24)
    if (hour >= 18) {
      if (minutesUntil <= 20) {
        return {
          type: "urgent",
          icon: "🌙",
          message:
            translations.eveningUrgent || `ערבית בעוד ${minutesUntil} דקות`,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
        };
      } else {
        return {
          type: "info",
          icon: "🌆",
          message: translations.eveningInfo || "זמן טוב לבדוק את זמני הערב",
          color: "text-indigo-600",
          bgColor: "bg-indigo-50",
          borderColor: "border-indigo-200",
        };
      }
    }

    return null;
  };

  if (!currentReminder) return null;

  return (
    <Card
      variant="glass"
      className={`mb-4 ${currentReminder.bgColor} ${currentReminder.borderColor} border-2 ${className}`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{currentReminder.icon}</div>
            <div>
              <p className={`text-sm font-medium ${currentReminder.color}`}>
                {currentReminder.message}
              </p>
              {nextPrayer && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {translations.nextPrayer || "התפילה הבאה"}: {nextPrayer.name}{" "}
                  - {nextPrayer.time}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="small"
            onClick={() => {
              // Scroll to prayer times
              const prayerSection = document.querySelector(
                "[data-prayer-times]"
              );
              if (prayerSection) {
                prayerSection.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }}
            className={`text-xs ${currentReminder.color} hover:opacity-80`}
          >
            {translations.viewTimes || "צפה בזמנים"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SmartPrayerReminders;
