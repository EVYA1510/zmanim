import React, { useState, useEffect } from "react";
import { HDate, HebrewCalendar, HebrewDate } from "@hebcal/core";
import { isIsraelDST } from "../pages/api/utils/israelDst";

const HebrewCalendarComponent = ({
  currentDate,
  onDateChange,
  currentLanguage = "he",
  translations = {},
}) => {
  const [showCalendar, setShowCalendar] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  // Get DST status
  const isDst = isIsraelDST(currentDate);
  const dstText = isDst
    ? translations.dstSummer || "שעון קיץ"
    : translations.dstWinter || "שעון חורף";

  // Ensure currentDate is a Date object for all operations
  const dateObj =
    currentDate instanceof Date ? currentDate : new Date(currentDate);

  // Get Hebrew date info with error handling
  let hdate, hebrewDate, hebrewMonth, hebrewYear, hebrewDay;

  try {
    hdate = new HDate(dateObj);
    hebrewDate = hdate.toString();
    hebrewMonth = hdate.getMonthName();
    hebrewYear = hdate.getFullYear();
    hebrewDay = hdate.getDate();
  } catch (error) {
    console.log("Error creating Hebrew date:", error);
    // Fallback to current date
    const today = new Date();
    hdate = new HDate(today);
    hebrewDate = hdate.toString();
    hebrewMonth = hdate.getMonthName();
    hebrewYear = hdate.getFullYear();
    hebrewDay = hdate.getDate();
  }

  // Get Hebrew day name manually
  const getHebrewDayName = (dayOfWeek) => {
    const hebrewDays = [
      "ראשון",
      "שני",
      "שלישי",
      "רביעי",
      "חמישי",
      "שישי",
      "שבת",
    ];
    return hebrewDays[dayOfWeek];
  };

  // Convert Hebrew month to traditional format
  const convertHebrewMonth = (monthName) => {
    const monthMap = {
      Tishrei: "תשרי",
      Cheshvan: "חשון",
      Kislev: "כסלו",
      Tevet: "טבת",
      Shevat: "שבט",
      Adar: "אדר",
      "Adar I": "אדר א׳",
      "Adar II": "אדר ב׳",
      Nisan: "ניסן",
      Iyar: "אייר",
      Iyyar: "אייר", // Alternative spelling
      Sivan: "סיון",
      Tammuz: "תמוז",
      Tamuz: "תמוז", // Alternative spelling
      Av: "אב",
      Elul: "אלול",
      // Additional variations
      Tishri: "תשרי",
      Cheshvan: "חשון",
      Kislev: "כסלו",
      Tevet: "טבת",
      Shevat: "שבט",
      "Sh'vat": "שבט", // Alternative spelling
      Adar: "אדר",
      Nisan: "ניסן",
      Sivan: "סיון",
      Tammuz: "תמוז",
      Tamuz: "תמוז", // Alternative spelling
      Av: "אב",
      Elul: "אלול",
    };
    return monthMap[monthName] || monthName;
  };

  // Convert year to Hebrew numerals (proper conversion)
  const convertToHebrewYear = (year) => {
    const hebrewYearMap = {
      5786: "תשפ״ו",
      5787: "תשפ״ז",
      5788: "תשפ״ח",
      5789: "תשפ״ט",
      5790: "תש״ץ",
      5791: "תשצ״א",
      5792: "תשצ״ב",
      5793: "תשצ״ג",
      5794: "תשצ״ד",
      5795: "תשצ״ה",
      5796: "תשצ״ו",
      5797: "תשצ״ז",
      5798: "תשצ״ח",
      5799: "תשצ״ט",
      5800: "תש״ק",
    };
    return hebrewYearMap[year] || year.toString();
  };

  // Format Hebrew date in traditional short format
  const formatHebrewDateShort = (hdate) => {
    if (!hdate) return "";

    try {
      const day = hdate.getDate();
      const month = hdate.getMonthName();
      const year = hdate.getFullYear();

      // Convert day to Hebrew numerals
      const hebrewNumerals = {
        1: "א'",
        2: "ב'",
        3: "ג'",
        4: "ד'",
        5: "ה'",
        6: "ו'",
        7: "ז'",
        8: "ח'",
        9: "ט'",
        10: "י'",
        11: "יא'",
        12: "יב'",
        13: "יג'",
        14: "יד'",
        15: "טו'",
        16: "טז'",
        17: "יז'",
        18: "יח'",
        19: "יט'",
        20: "כ'",
        21: "כא'",
        22: "כב'",
        23: "כג'",
        24: "כד'",
        25: "כה'",
        26: "כו'",
        27: "כז'",
        28: "כח'",
        29: "כט'",
        30: "ל'",
      };

      return `${hebrewNumerals[day] || day} ${convertHebrewMonth(
        month
      )} ${convertToHebrewYear(year)}`;
    } catch (error) {
      console.log("Error formatting Hebrew date:", error);
      return "";
    }
  };

  const hebrewDayName = getHebrewDayName(dateObj.getDay());
  const hebrewDateShort = formatHebrewDateShort(hdate);

  // Convert Hebrew day number to Hebrew numerals for calendar
  const convertToHebrewNumerals = (dayNumber) => {
    const hebrewNumerals = {
      1: "א",
      2: "ב",
      3: "ג",
      4: "ד",
      5: "ה",
      6: "ו",
      7: "ז",
      8: "ח",
      9: "ט",
      10: "י",
      11: "יא",
      12: "יב",
      13: "יג",
      14: "יד",
      15: "טו",
      16: "טז",
      17: "יז",
      18: "יח",
      19: "יט",
      20: "כ",
      21: "כא",
      22: "כב",
      23: "כג",
      24: "כד",
      25: "כה",
      26: "כו",
      27: "כז",
      28: "כח",
      29: "כט",
      30: "ל",
    };
    return hebrewNumerals[dayNumber] || dayNumber.toString();
  };

  // Get holidays for the current month
  const getHolidaysForMonth = () => {
    try {
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();

      // Get Hebrew calendar for the month
      const hebrewCalendar = new HebrewCalendar();
      const holidays = [];

      // Get Hebrew date for current month
      const currentHebrewDate = new HDate(dateObj);
      const hebrewMonth = currentHebrewDate.getMonth();
      const hebrewYear = currentHebrewDate.getFullYear();

      // Check for major holidays in the current Hebrew month
      const majorHolidays = [
        { name: "ראש השנה", hebrewMonth: 0, day: 1 },
        { name: "יום כיפור", hebrewMonth: 0, day: 10 },
        { name: "סוכות", hebrewMonth: 0, day: 15 },
        { name: "שמיני עצרת", hebrewMonth: 0, day: 22 },
        { name: "חנוכה", hebrewMonth: 1, day: 25 },
        { name: "פורים", hebrewMonth: 1, day: 14 },
        { name: "פסח", hebrewMonth: 2, day: 15 },
        { name: "שביעי של פסח", hebrewMonth: 2, day: 21 },
        { name: "יום העצמאות", hebrewMonth: 3, day: 5 },
        { name: 'ל"ג בעומר', hebrewMonth: 3, day: 18 },
        { name: "שבועות", hebrewMonth: 4, day: 6 },
        { name: "תשעה באב", hebrewMonth: 4, day: 9 },
      ];

      // Check if any holidays fall in the current Hebrew month
      majorHolidays.forEach((holiday) => {
        if (holiday.hebrewMonth === hebrewMonth) {
          // Create Hebrew date for the holiday
          const holidayHebrewDate = new HDate(
            hebrewYear,
            holiday.hebrewMonth,
            holiday.day
          );
          // Convert to Gregorian date
          const gregorianDate = holidayHebrewDate.greg();

          holidays.push({
            name: holiday.name,
            day: holiday.day,
            date: gregorianDate,
          });
        }
      });

      return holidays;
    } catch (error) {
      console.log("Error getting holidays:", error);
      return [];
    }
  };

  const currentHolidays = getHolidaysForMonth();

  // Get month name in Hebrew
  const getMonthName = (month) => {
    const months = [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ];
    return months[month];
  };

  // Get day names in Hebrew
  const getDayName = (day) => {
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    return days[day];
  };

  // Keyboard shortcuts for date navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle shortcuts when calendar is open and no input is focused
      if (
        !showCalendar ||
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      const { key, shiftKey, altKey } = event;

      // Day navigation (Arrow keys)
      if (key === "ArrowLeft" && !shiftKey && !altKey) {
        event.preventDefault();
        handleDateChange(new Date(dateObj.getTime() - 24 * 60 * 60 * 1000));
      } else if (key === "ArrowRight" && !shiftKey && !altKey) {
        event.preventDefault();
        handleDateChange(new Date(dateObj.getTime() + 24 * 60 * 60 * 1000));
      }
      // Month navigation (Shift + Arrow keys)
      else if (key === "ArrowLeft" && shiftKey && !altKey) {
        event.preventDefault();
        const newDate = new Date(dateObj);
        newDate.setMonth(newDate.getMonth() - 1);
        handleDateChange(newDate);
      } else if (key === "ArrowRight" && shiftKey && !altKey) {
        event.preventDefault();
        const newDate = new Date(dateObj);
        newDate.setMonth(newDate.getMonth() + 1);
        handleDateChange(newDate);
      }
      // Year navigation (Alt + Arrow keys)
      else if (key === "ArrowLeft" && !shiftKey && altKey) {
        event.preventDefault();
        const newDate = new Date(dateObj);
        newDate.setFullYear(newDate.getFullYear() - 1);
        handleDateChange(newDate);
      } else if (key === "ArrowRight" && !shiftKey && altKey) {
        event.preventDefault();
        const newDate = new Date(dateObj);
        newDate.setFullYear(newDate.getFullYear() + 1);
        handleDateChange(newDate);
      }
      // Today shortcut (T key)
      else if (key === "t" || key === "T") {
        event.preventDefault();
        handleDateChange(new Date());
      }
    };

    if (showCalendar) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCalendar, currentDate, onDateChange]);

  const handleDateChange = (newDate) => {
    onDateChange(newDate);
    setStatusMessage(
      currentLanguage === "he" ? "התאריך עודכן" : "Date updated"
    );
    setTimeout(() => setStatusMessage(""), 2000);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(dateObj);
  const monthName = getMonthName(dateObj.getMonth());
  const year = dateObj.getFullYear();

  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl border-2 border-blue-600 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>📅</span>
        <span>
          {translations.calendarTitle ||
            (currentLanguage === "he" ? "לוח שנה" : "Hebrew Calendar")}
        </span>
      </h3>

      {/* Current Date Display */}
      <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-400">
        <div className="text-lg font-bold text-blue-800 mb-3">
          {translations.currentDate ||
            (currentLanguage === "he" ? "תאריך נוכחי" : "Current Date")}
        </div>

        {/* Combined Date Display */}
        <div className="space-y-3">
          {/* Date Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Gregorian Date Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {translations.gregorianDate ||
                  (currentLanguage === "he"
                    ? "תאריך גרגוריאני"
                    : "Gregorian Date")}
              </div>
              <div className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {getDayName(dateObj.getDay())}, {dateObj.getDate()} {monthName}{" "}
                {year}
              </div>
            </div>

            {/* Hebrew Date Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                {translations.hebrewDate ||
                  (currentLanguage === "he" ? "תאריך עברי" : "Hebrew Date")}
              </div>
              <div className="text-base font-semibold text-blue-800">
                {hebrewDateShort}
              </div>
            </div>
          </div>

          {/* DST Status Card */}
          <div
            className={`rounded-md px-2 py-1 border text-center ${
              isDst
                ? "bg-orange-50 border-orange-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div
              className={`text-xs font-medium ${
                isDst ? "text-orange-700" : "text-blue-700"
              }`}
            >
              {dstText}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Toggle Button */}

      {/* Calendar Display */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-yellow-400 dark:border-yellow-500 p-2 sm:p-3 shadow-lg max-w-full overflow-hidden">
        {/* Calendar Header - More Compact */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-center">
            <h4 className="text-base font-bold text-yellow-800 mb-1">
              {convertHebrewMonth(hebrewMonth)}{" "}
              {convertToHebrewYear(hebrewYear)}
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {monthName} {year}
            </div>
          </div>
        </div>

        {/* Date Navigation Toolbar - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-3 p-1 sm:p-2 bg-gray-50 rounded-lg border border-gray-200 gap-2 sm:gap-0">
          {/* Day Navigation */}
          <div className="flex gap-0.5 sm:gap-1">
            <button
              onClick={() =>
                handleDateChange(
                  new Date(dateObj.getTime() - 24 * 60 * 60 * 1000)
                )
              }
              className="px-1 sm:px-2 py-1 bg-green-700 hover:bg-blue-600 text-white border-2 border-green-600 rounded text-xs font-semibold transition-all duration-200"
              title={currentLanguage === "he" ? "יום קודם" : "Previous Day"}
            >
              {currentLanguage === "he" ? "→" : "←"}
            </button>
            <button
              onClick={() => handleDateChange(new Date())}
              className="px-2 sm:px-3 py-1 bg-green-700 hover:bg-green-600 text-white border-2 border-green-600 rounded text-xs font-semibold transition-all duration-200"
              title={currentLanguage === "he" ? "היום" : "Today"}
            >
              <span className="hidden sm:inline">
                {currentLanguage === "he" ? "היום" : "Today"}
              </span>
              <span className="sm:hidden">היום</span>
            </button>
            <button
              onClick={() =>
                handleDateChange(
                  new Date(dateObj.getTime() + 24 * 60 * 60 * 1000)
                )
              }
              className="px-1 sm:px-2 py-1 bg-green-700 hover:bg-blue-600 text-white border-2 border-green-600 rounded text-xs font-semibold transition-all duration-200"
              title={currentLanguage === "he" ? "יום הבא" : "Next Day"}
            >
              {currentLanguage === "he" ? "←" : "→"}
            </button>
          </div>

          {/* Month/Year Navigation */}
          <div className="flex gap-0.5 sm:gap-1">
            <button
              onClick={() => {
                const newDate = new Date(dateObj);
                newDate.setMonth(newDate.getMonth() - 1);
                handleDateChange(newDate);
              }}
              className="px-1 sm:px-2 py-1 bg-green-700 hover:bg-purple-600 text-white border-2 border-green-600 rounded text-xs font-semibold transition-all duration-200"
              title={currentLanguage === "he" ? "חודש קודם" : "Previous Month"}
            >
              {currentLanguage === "he" ? "▶" : "◀"}
            </button>
            <button
              onClick={() => {
                const newDate = new Date(dateObj);
                newDate.setMonth(newDate.getMonth() + 1);
                handleDateChange(newDate);
              }}
              className="px-1 sm:px-2 py-1 bg-green-700 hover:bg-purple-600 text-white border-2 border-green-600 rounded text-xs font-semibold transition-all duration-200"
              title={currentLanguage === "he" ? "חודש הבא" : "Next Month"}
            >
              {currentLanguage === "he" ? "◀" : "▶"}
            </button>
          </div>

          {/* Year Navigation */}
          <div className="flex gap-0.5 sm:gap-1">
            <button
              onClick={() => {
                const newDate = new Date(dateObj);
                newDate.setFullYear(newDate.getFullYear() - 1);
                handleDateChange(newDate);
              }}
              className="px-1 sm:px-2 py-1 bg-green-700 hover:bg-yellow-600 text-white border-2 border-green-600 rounded text-xs font-semibold transition-all duration-200"
              title={currentLanguage === "he" ? "שנה קודמת" : "Previous Year"}
            >
              {currentLanguage === "he" ? "▶▶" : "◀◀"}
            </button>
            <button
              onClick={() => {
                const newDate = new Date(dateObj);
                newDate.setFullYear(newDate.getFullYear() + 1);
                handleDateChange(newDate);
              }}
              className="px-1 sm:px-2 py-1 bg-green-700 hover:bg-yellow-600 text-white border-2 border-green-600 rounded text-xs font-semibold transition-all duration-200"
              title={currentLanguage === "he" ? "שנה הבאה" : "Next Year"}
            >
              {currentLanguage === "he" ? "◀◀" : "▶▶"}
            </button>
          </div>
        </div>

        {/* Day Headers - Responsive */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
          {["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"].map((day, index) => (
            <div
              key={index}
              className="p-0.5 sm:p-1 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid - Responsive */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {days.map((day, index) => {
            // Get Hebrew date for this day
            const dayHebrewDate = day ? new HDate(day) : null;
            const dayHebrewDay = dayHebrewDate ? dayHebrewDate.getDate() : null;

            return (
              <button
                key={index}
                onClick={() => day && handleDateChange(day)}
                disabled={!day}
                className="p-0.5 sm:p-1 text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded cursor-pointer transition-all duration-200 min-h-[28px] sm:min-h-[35px] flex flex-col items-center justify-center gap-0.5 sm:gap-1 hover:bg-yellow-500 hover:text-white hover:scale-105 disabled:opacity-0"
              >
                {day && (
                  <>
                    <div className="text-xs sm:text-sm font-bold">
                      {day.getDate()}
                    </div>
                    {dayHebrewDay && (
                      <div className="text-xs opacity-70 hidden sm:block">
                        {convertToHebrewNumerals(dayHebrewDay)}
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Holidays Display */}
        {currentHolidays.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-400">
            <div className="text-sm font-semibold text-yellow-800 mb-2">
              {currentLanguage === "he"
                ? "חגים בחודש זה:"
                : "Holidays this month:"}
            </div>
            {currentHolidays.map((holiday, index) => (
              <div
                key={index}
                className="text-xs text-gray-700 dark:text-gray-300 mb-1"
              >
                • {holiday.name} ({holiday.day}/{holiday.date.getMonth() + 1})
              </div>
            ))}
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mt-3 p-2 bg-blue-100 text-blue-800 rounded text-xs font-semibold text-center border border-blue-300"
          >
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default HebrewCalendarComponent;
