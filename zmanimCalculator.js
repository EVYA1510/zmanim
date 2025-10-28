/**
 * Zmanim Calculator - Complete Prayer Times Calculation System
 * Based on astronomical calculations for any location worldwide
 *
 * Usage: Import this file and use the functions to calculate prayer times
 *
 * @author Based on Zmanim Web Project
 * @version 1.0.0
 */

/**
 * Compute solar intermediate values for a given date and longitude.
 * @param {Date} day - JavaScript Date (local or UTC, we only use its Y/M/D)
 * @param {number} longitude - in decimal degrees (e.g. 35.25)
 * @returns {Object} - { E, G, L, alpha, delta, epsilon, lambda, averageMidday }
 */
export function calculateIntermediateValues(day, longitude) {
  // 1) Convert longitude into "minutes offset" from prime meridian
  const lon = -longitude;
  const averageMidday = lon * 4; // in minutes

  // 2) Days since epoch (Jan 1 2000)
  const epoch = new Date(2000, 0, 1); // months are 0-based
  const diffMs = day.getTime() - epoch.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const numberOfDays = Math.trunc(diffDays);

  // 3) Break averageMidday into h:m:s
  const totalHours = averageMidday / 60;
  const hour = Math.round(totalHours);
  const minute = Math.round((totalHours - hour) * 60);
  const second = Math.round(((totalHours - hour) * 60 - minute) * 60);

  // 4) Convert to fraction of a day
  const avgMidFrac = hour / 24 + minute / 1440 + second / 86400;
  const daysSince = numberOfDays - avgMidFrac;

  // 5) Mean longitude of the sun L (degrees)
  const l0 = 280.461 + 0.9856474 * daysSince;
  const L = l0 % 360;

  // 6) Sun's mean anomaly G (degrees)
  const g0 = 357.528 + 0.9856003 * daysSince;
  const G = g0 % 360;

  // 7) Sun's true longitude λ (degrees)
  const lambda0 =
    L +
    1.915 * Math.sin((G * Math.PI) / 180) +
    0.02 * Math.sin((2 * G * Math.PI) / 180);
  const lambda = lambda0 % 360;

  // 8) Obliquity of the ecliptic ε (≈23.44°)
  const epsilon = 23.44;

  // 9) Sun's right ascension α (degrees)
  let alpha =
    (Math.atan(
      Math.tan((lambda * Math.PI) / 180) * Math.cos((epsilon * Math.PI) / 180)
    ) *
      180) /
    Math.PI;
  // Normalize into [0,180)
  if (alpha > 0) alpha = alpha % 180;
  while (alpha < 0) alpha += 180;

  // 10) Equation of time E (minutes)
  let E = (alpha - L) * 4; // 4 minutes per degree
  E = E % 60;
  while (E < -20) E += 60; // match C#'s correction

  // 11) Sun's declination δ (degrees)
  const delta =
    (Math.asin(
      Math.sin((lambda * Math.PI) / 180) * Math.sin((epsilon * Math.PI) / 180)
    ) *
      180) /
    Math.PI;

  return { E, G, L, alpha, delta, epsilon, lambda, averageMidday };
}

/**
 * Calculate solar noon (chatzot) for a given date, DST‐shift, and longitude.
 * @param {Date} day - the date for which to compute noon
 * @param {number} shift - UTC offset in hours (e.g. 2 or 3)
 * @param {number} longitude - decimal degrees (positive east)
 * @returns {Date} - JavaScript Date for solar noon
 */
export function calculateMidday(day, shift, longitude) {
  const { averageMidday, E } = calculateIntermediateValues(day, longitude);
  const hatzotOffsetMin = 12 * 60 - averageMidday + shift * 60 + E;
  const hatzotOffsetMs = Math.trunc(hatzotOffsetMin * 60 * 1000);

  return new Date(day.getTime() + hatzotOffsetMs);
}

/**
 * Calculate the millisecond offset from solar noon for a given sun‐angle.
 * @param {number} angle - sun altitude in degrees (negative for below horizon)
 * @param {Date} day - the date
 * @param {number} latitude - decimal degrees
 * @param {number} longitude - decimal degrees
 * @returns {number} - offset in milliseconds (to subtract or add to chatzot)
 */
export function calculateOffsetOfAngle(angle, day, latitude, longitude) {
  const { delta } = calculateIntermediateValues(day, longitude);

  const sinDeg = (d) => Math.sin((d * Math.PI) / 180);
  const cosDeg = (d) => Math.cos((d * Math.PI) / 180);

  const numerator = sinDeg(angle) - sinDeg(latitude) * sinDeg(delta);
  const denominator = cosDeg(latitude) * cosDeg(delta);
  const arcRad = Math.acos(numerator / denominator);
  const arcDeg = (arcRad * 180) / Math.PI;
  const hoursOffset = arcDeg / 15;

  return Math.trunc(hoursOffset * 60 * 60 * 1000);
}

/**
 * Compute all zmanim inputs for a given date, shift, and location.
 * @param {Date} day - the date
 * @param {number} shift - UTC offset in hours (e.g. 2 or 3)
 * @param {number} latitude - decimal degrees
 * @param {number} longitude - decimal degrees
 * @returns {Object} - all prayer times
 */
export function calculateZmanInputs(day, shift, latitude, longitude) {
  // 1) solar noon
  const chatzot = calculateMidday(day, shift, longitude);
  const chatzotHaLayla = new Date(chatzot.getTime() + 12 * 60 * 60 * 1000);

  // 2) offsets for each angle and apply offset to get the actual Date
  const alot90OffsetMs = calculateOffsetOfAngle(
    -19.75,
    day,
    latitude,
    longitude
  );
  const alot90 = new Date(chatzot.getTime() - alot90OffsetMs);

  const alot72OffsetMs = calculateOffsetOfAngle(
    -15.99,
    day,
    latitude,
    longitude
  );
  const alot72 = new Date(chatzot.getTime() - alot72OffsetMs);

  const talitTefillinOffsetMs = calculateOffsetOfAngle(
    -11.5,
    day,
    latitude,
    longitude
  );
  const talitTefillin = new Date(chatzot.getTime() - talitTefillinOffsetMs);

  const zrichaOffsetMs = calculateOffsetOfAngle(
    -0.8333,
    day,
    latitude,
    longitude
  );
  const zricha = new Date(chatzot.getTime() - zrichaOffsetMs);

  const shkiyaMs = chatzot.getTime() + (chatzot.getTime() - zricha.getTime());
  const shkiya = new Date(shkiyaMs);

  const tzaitOffsetMs = calculateOffsetOfAngle(-4.65, day, latitude, longitude);
  const tzait = new Date(chatzot.getTime() + tzaitOffsetMs);
  const tzait90 = new Date(
    chatzot.getTime() + (chatzot.getTime() - alot72.getTime())
  );

  // Calculate seasonal hours
  const shaaZmanitGra = (chatzot.getTime() - zricha.getTime()) / 6;
  const shaaZmanitMagenAvraham = (chatzot.getTime() - alot72.getTime()) / 6;

  // Time-based calculations
  const sofZmanShemaMGA = new Date(
    alot72.getTime() + shaaZmanitMagenAvraham * 3
  );
  const sofZmanShemaGRA = new Date(zricha.getTime() + shaaZmanitGra * 3);
  const sofZmanTefilaMGA = new Date(
    alot72.getTime() + shaaZmanitMagenAvraham * 4
  );
  const sofZmanTefilaGRA = new Date(zricha.getTime() + shaaZmanitGra * 4);
  const musafGRA = new Date(zricha.getTime() + shaaZmanitGra * 7);
  const startOfTenthHourGRA = new Date(zricha.getTime() + shaaZmanitGra * 9);
  const startOfTenthHourMGA = new Date(
    alot72.getTime() + shaaZmanitMagenAvraham * 9
  );
  const fourthHourGRA = new Date(zricha.getTime() + shaaZmanitGra * 4);
  const fourthHourMGA = new Date(alot72.getTime() + shaaZmanitMagenAvraham * 4);
  const fifthHourGRA = new Date(zricha.getTime() + shaaZmanitGra * 5);
  const fifthHourMGA = new Date(alot72.getTime() + shaaZmanitMagenAvraham * 5);

  const minchaGedola = new Date(zricha.getTime() + shaaZmanitGra * 6.5);
  const minchaKetana = new Date(zricha.getTime() + shaaZmanitGra * 9.5);
  const plagMincha = new Date(shkiya.getTime() - shaaZmanitGra * 1.25);

  return {
    alot90,
    alot72,
    talitTefillin,
    zricha,
    sofZmanTefilaGRA,
    sofZmanShemaMGA,
    sofZmanShemaGRA,
    sofZmanTefilaMGA,
    musafGRA,
    startOfTenthHourGRA,
    startOfTenthHourMGA,
    fourthHourGRA,
    fourthHourMGA,
    fifthHourGRA,
    fifthHourMGA,
    minchaGedola,
    minchaKetana,
    shkiya,
    chatzot,
    plagMincha,
    tzait,
    tzait90,
    chatzotHaLayla,
  };
}

/**
 * Calculate Shabbat times for a given date and location
 * @param {string} date - date string in YYYY-MM-DD format
 * @param {number} latitude - decimal degrees
 * @param {number} longitude - decimal degrees
 * @param {number} shift - UTC offset in hours
 * @returns {Object} - Shabbat times
 */
export function calculateShabbatTimes(date, latitude, longitude, shift) {
  // Find the upcoming Friday
  const dow = new Date(date).getDay(); // 0=Sunday, 1=Monday, ..., 5=Friday, 6=Saturday

  let daysToFriday;
  if (dow === 5) {
    daysToFriday = 0; // Today is Friday
  } else if (dow === 6) {
    daysToFriday = 6; // Today is Saturday, next Friday is 6 days ahead
  } else {
    daysToFriday = 5 - dow; // Sunday(0) through Thursday(4)
  }

  let daysToMotzash;
  if (dow === 6) {
    daysToMotzash = 0; // Today is Saturday
  } else {
    daysToMotzash = 6 - dow; // This week's Saturday
  }

  // Calculate Friday's date and sunset
  const fridayDate = new Date(date);
  fridayDate.setDate(fridayDate.getDate() + daysToFriday);
  const fridayShift = getIsraelOffsetHours(fridayDate);
  const { shkiya: shkiyaFri } = calculateZmanInputs(
    fridayDate,
    fridayShift,
    latitude,
    longitude
  );

  // Calculate Motzash date and sunset
  const MotzashDate = new Date(date);
  MotzashDate.setDate(MotzashDate.getDate() + daysToMotzash);
  const MotzashShift = getIsraelOffsetHours(MotzashDate);
  const { shkiya: shkiyaMotzash } = calculateZmanInputs(
    MotzashDate,
    MotzashShift,
    latitude,
    longitude
  );

  // Calculate Shabbat times
  const kenisatShabbat22 = new Date(shkiyaFri.getTime() - 22 * 60_000);
  const kenisatShabbat30 = new Date(shkiyaFri.getTime() - 30 * 60_000);
  const kenisatShabbat40 = new Date(shkiyaFri.getTime() - 40 * 60_000);
  const yetziatShabbat = new Date(shkiyaMotzash.getTime() + 35 * 60_000);

  return {
    kenisatShabbat22,
    kenisatShabbat30,
    kenisatShabbat40,
    yetziatShabbat,
  };
}

/**
 * Return Israel's offset in hours (2 or 3) for any JS Date.
 */
export function getIsraelOffsetHours(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    timeZoneName: "short",
  }).formatToParts(date);

  const tz = parts.find((p) => p.type === "timeZoneName").value;
  return Number(tz.replace("GMT", ""));
}

/**
 * Get local timezone offset for any location
 * @param {Date} date - the date
 * @param {string} timezone - timezone string (e.g. "America/New_York")
 * @returns {number} - UTC offset in hours
 */
export function getLocalOffsetHours(date, timezone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  }).formatToParts(date);

  const tz = parts.find((p) => p.type === "timeZoneName").value;
  return Number(tz.replace("GMT", ""));
}

/**
 * Format time to Hebrew locale
 * @param {Date} date - the date to format
 * @returns {string} - formatted time string
 */
export function formatZman(date) {
  return date.toLocaleTimeString("he-IL", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Get Hebrew date for a given Gregorian date
 * @param {string} gregorianDate - date string in YYYY-MM-DD format
 * @returns {Object} - Hebrew date information
 */
export function getHebrewDate(gregorianDate) {
  try {
    const [year, month, day] = gregorianDate.split("-").map(Number);
    if (!year || !month || !day) return null;

    const date = new Date(year, month - 1, day);

    const numericFormatter = new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    const monthNameFormatter = new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
      month: "long",
    });

    const parts = numericFormatter.formatToParts(date);

    const hebrewDate = {
      day: parseInt(parts.find((p) => p.type === "day").value),
      month: parseInt(parts.find((p) => p.type === "month").value),
      year: parseInt(parts.find((p) => p.type === "year").value),
      monthName: monthNameFormatter.format(date),
    };

    // Convert numbers to Hebrew letters (simplified)
    const numberToHebrew = (num) => {
      const hebrewNums = {
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
      return hebrewNums[num] || num.toString();
    };

    const hebDay = numberToHebrew(hebrewDate.day);

    return {
      date: `${hebDay}׳ ${hebrewDate.monthName} ${hebrewDate.year}`,
      holidays: [], // Simplified - you can add holiday detection here
    };
  } catch (error) {
    console.error("Error converting to Hebrew date:", error);
    return null;
  }
}

/**
 * Zmanim labels in Hebrew and English
 */
export const ZMANIM_LABELS = {
  he: {
    // זמני הבוקר
    alot90: "עלות השחר",
    alot72: "עלות השחר (72 דק')",
    talitTefillin: "טלית ותפילין",
    zricha: "זריחה",
    sofShemaMGA: 'סוף זמן קריאת שמע (מג"א)',
    sofShemaGRA: 'סוף זמן קריאת שמע (גר"א)',
    sofTefilaMGA: 'סוף זמן תפילה (מג"א)',
    sofTefilaGRA: 'סוף זמן תפילה (גר"א)',

    // זמני היום
    chatzot: "חצות היום",
    minchaGedola: "מנחה גדולה",
    minchaKetana: "מנחה קטנה",
    shkiya: "שקיעה",

    // זמני הערב
    tzait: "צאת הכוכבים",
    chatzotHaLayla: "חצות הלילה",

    // זמני שבת
    kenisatShabbat22: "כניסת שבת (22 דק')",
    kenisatShabbat30: "כניסת שבת (30 דק')",
    kenisatShabbat40: "כניסת שבת (40 דק')",
    yetziatShabbat: "יציאת שבת",
    parasha: "פרשת השבוע",
  },
  en: {
    // Morning Times
    alot90: "Dawn",
    alot72: "Dawn (72 min)",
    talitTefillin: "Tallit & Tefillin",
    zricha: "Sunrise",
    sofShemaMGA: "Latest Shema (MGA)",
    sofShemaGRA: "Latest Shema (GRA)",
    sofTefilaMGA: "Latest Tefillah (MGA)",
    sofTefilaGRA: "Latest Tefillah (GRA)",

    // Day Times
    chatzot: "Midday",
    minchaGedola: "Mincha Gedola",
    minchaKetana: "Mincha Ketana",
    shkiya: "Sunset",

    // Evening Times
    tzait: "Nightfall",
    chatzotHaLayla: "Midnight",

    // Shabbat Times
    kenisatShabbat22: "Candle Lighting (22 min)",
    kenisatShabbat30: "Candle Lighting (30 min)",
    kenisatShabbat40: "Candle Lighting (40 min)",
    yetziatShabbat: "Havdalah",
    parasha: "Torah Portion",
  },
};

/**
 * Time groups labels
 */
export const TIME_GROUPS = {
  he: {
    morningTimes: "זמני הבוקר",
    dayTimes: "זמני היום",
    eveningTimes: "זמני הערב",
    shabbatTimes: "זמני שבת",
  },
  en: {
    morningTimes: "Morning Times",
    dayTimes: "Day Times",
    eveningTimes: "Evening Times",
    shabbatTimes: "Shabbat Times",
  },
};

/**
 * Example usage function
 */
export function calculateZmanimExample(
  latitude = 31.7683,
  longitude = -35.2137,
  date = "2024-01-15"
) {
  const day = new Date(date + "T00:00:00.000Z");
  const shift = getIsraelOffsetHours(day);

  const zmanim = calculateZmanInputs(day, shift, latitude, longitude);
  const shabbatTimes = calculateShabbatTimes(date, latitude, longitude, shift);
  const hebrewDate = getHebrewDate(date);

  return {
    ...zmanim,
    ...shabbatTimes,
    hebrewDate,
    formatted: {
      zricha: formatZman(zmanim.zricha),
      shkiya: formatZman(zmanim.shkiya),
      chatzot: formatZman(zmanim.chatzot),
    },
  };
}

// Export default for easy importing
export default {
  calculateIntermediateValues,
  calculateMidday,
  calculateOffsetOfAngle,
  calculateZmanInputs,
  calculateShabbatTimes,
  getIsraelOffsetHours,
  getLocalOffsetHours,
  formatZman,
  getHebrewDate,
  ZMANIM_LABELS,
  TIME_GROUPS,
  calculateZmanimExample,
};
