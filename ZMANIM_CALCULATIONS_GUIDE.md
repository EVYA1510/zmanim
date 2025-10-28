# 🕐 מדריך חישובי זמני התפילה - Zmanim Calculations Guide

## 📋 תוכן העניינים

1. [מבוא](#מבוא)
2. [קבצי החישוב](#קבצי-החישוב)
3. [אלגוריתמים חישוביים](#אלגוריתמים-חישוביים)
4. [כותרות וטקסטים](#כותרות-וטקסטים)
5. [דוגמאות קוד](#דוגמאות-קוד)
6. [הוראות שימוש](#הוראות-שימוש)

---

## 🎯 מבוא

מסמך זה מכיל את כל החישובים, האלגוריתמים והנתונים הנדרשים לבניית אפליקציית זמני תפילה. הקוד מבוסס על חישובים אסטרונומיים מדויקים ומתאים לכל מיקום גיאוגרפי בעולם.

**מקור**: פרויקט Zmanim Web - Next.js Application

---

## 📁 קבצי החישוב

### 1. **zmanCalculator.js** - הקובץ הראשי לחישובים

### 2. **timezone.js** - חישובי אזור זמן

### 3. **hebrewDate.js** - המרת תאריכים עבריים

### 4. **parasha.js** - חישוב פרשת השבוע

---

## 🧮 אלגוריתמים חישוביים

### 1. חישוב ערכי ביניים סולאריים

```javascript
/**
 * Compute solar intermediate values for a given date and longitude.
 * @param {Date} day - JavaScript Date (local or UTC, we only use its Y/M/D)
 * @param {number} longitude - in decimal degrees (e.g. 35.25)
 * @returns {Object} - { E, G, L, alpha, delta, epsilon, lambda, averageMidday }
 */
function calculateIntermediateValues(day, longitude) {
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
```

### 2. חישוב חצות היום (חצות)

```javascript
/**
 * Calculate solar noon (chatzot) for a given date, DST‐shift, and longitude.
 * @param {Date} day - the date for which to compute noon
 * @param {number} shift - UTC offset in hours (e.g. 2 or 3)
 * @param {number} longitude - decimal degrees (positive east)
 * @returns {Date} - JavaScript Date for solar noon
 */
function calculateMidday(day, shift, longitude) {
  const { averageMidday, E } = calculateIntermediateValues(day, longitude);
  const hatzotOffsetMin = 12 * 60 - averageMidday + shift * 60 + E;
  const hatzotOffsetMs = Math.trunc(hatzotOffsetMin * 60 * 1000);

  return new Date(day.getTime() + hatzotOffsetMs);
}
```

### 3. חישוב זוויות השמש

```javascript
/**
 * Calculate the millisecond offset from solar noon for a given sun‐angle.
 * @param {number} angle - sun altitude in degrees (negative for below horizon)
 * @param {Date} day - the date
 * @param {number} latitude - decimal degrees
 * @param {number} longitude - decimal degrees
 * @returns {number} - offset in milliseconds (to subtract or add to chatzot)
 */
function calculateOffsetOfAngle(angle, day, latitude, longitude) {
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
```

### 4. חישוב כל זמני התפילה

```javascript
/**
 * Compute all zmanim inputs for a given date, shift, and location.
 * @param {Date} day - the date
 * @param {number} shift - UTC offset in hours (e.g. 2 or 3)
 * @param {number} latitude - decimal degrees
 * @param {number} longitude - decimal degrees
 * @returns {Object} - all prayer times
 */
function calculateZmanInputs(day, shift, latitude, longitude) {
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
```

### 5. חישוב זמני שבת

```javascript
function calculateShabbatTimes(date, latitude, longitude, shift) {
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
```

### 6. חישוב אזור זמן ישראל

```javascript
/**
 * Return Israel's offset in hours (2 or 3) for any JS Date.
 */
function getIsraelOffsetHours(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    timeZoneName: "short",
  }).formatToParts(date);

  const tz = parts.find((p) => p.type === "timeZoneName").value;
  return Number(tz.replace("GMT", ""));
}
```

---

## 📝 כותרות וטקסטים

### כותרות זמני התפילה (עברית/אנגלית)

```javascript
const ZMANIM_LABELS = {
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
```

### כותרות קבוצות זמנים

```javascript
const TIME_GROUPS = {
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
```

---

## 🔢 נוסחאות מרכזיות

### זוויות השמש:

- **עלות השחר (90 דק')**: -19.75°
- **עלות השחר (72 דק')**: -15.99°
- **טלית ותפילין**: -11.5°
- **זריחה**: -0.8333°
- **צאת הכוכבים**: -4.65°

### שעות זמניות:

```javascript
// שעה זמנית לפי גר"א (מזריחה לשקיעה)
const shaaZmanitGra = (chatzot - zricha) / 6;

// שעה זמנית לפי מג"א (מעלות השחר 72 לשקיעה)
const shaaZmanitMagenAvraham = (chatzot - alot72) / 6;
```

### זמני שבת:

```javascript
// כניסת שבת (22 דקות לפני שקיעה)
const kenisatShabbat22 = new Date(shkiyaFri.getTime() - 22 * 60_000);

// יציאת שבת (35 דקות אחרי שקיעה)
const yetziatShabbat = new Date(shkiyaMotzash.getTime() + 35 * 60_000);
```

---

## 📅 חישוב תאריכים עבריים

```javascript
// Hebrew number to letter mapping
const HEBREW_NUMS = {
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

// Hebrew months names
const HEBREW_MONTHS = {
  7: "תשרי",
  8: "חשון",
  9: "כסלו",
  10: "טבת",
  11: "שבט",
  12: "אדר",
  13: "אדר א׳",
  1: "ניסן",
  2: "אייר",
  3: "סיון",
  4: "תמוז",
  5: "אב",
  6: "אלול",
  14: "אדר ב׳",
};

function getHebrewDate(gregorianDate) {
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

    const hebDay = numberToHebrew(hebrewDate.day);
    const hebYear = numberToHebrew(hebrewDate.year);

    return {
      date: `${hebDay}׳ ${hebrewDate.monthName} ${hebYear}`,
      holidays: getHolidays(hebrewDate),
    };
  } catch (error) {
    console.error("Error converting to Hebrew date:", error);
    return null;
  }
}
```

---

## 🎯 הוראות שימוש עם Cursor

### 1. הכנת הפרויקט

```bash
# צור פרויקט חדש
mkdir my-zmanim-app
cd my-zmanim-app

# אתחול פרויקט
npm init -y
npm install @hebcal/core
```

### 2. הוראות ל-Cursor

**העתק את הקוד הבא לקובץ חדש:**

```javascript
// zmanimCalculator.js
// העתק את כל הפונקציות מהסעיף "אלגוריתמים חישוביים"
```

**צור קובץ API:**

```javascript
// api/zmanim.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { latitude, longitude, date } = req.body;
  const day = new Date(date + "T00:00:00.000Z");
  const shift = getIsraelOffsetHours(day);

  const zmanim = calculateZmanInputs(day, shift, latitude, longitude);
  const shabbatTimes = calculateShabbatTimes(date, latitude, longitude, shift);

  return res.status(200).json({
    ...zmanim,
    ...shabbatTimes,
    parasha: getParashaSpecial(day),
  });
}
```

### 3. דוגמת שימוש

```javascript
// דוגמה לחישוב זמני תפילה
const latitude = 31.7683; // ירושלים
const longitude = -35.2137;
const date = "2024-01-15";

const zmanim = calculateZmanInputs(
  new Date(date + "T00:00:00.000Z"),
  getIsraelOffsetHours(new Date(date)),
  latitude,
  longitude
);

console.log("זריחה:", zmanim.zricha);
console.log("שקיעה:", zmanim.shkiya);
console.log("חצות:", zmanim.chatzot);
```

### 4. התאמה למיקום אחר

```javascript
// לדוגמה: ניו יורק
const nyLatitude = 40.7128;
const nyLongitude = 74.006;

// חישוב אזור זמן מקומי
function getLocalOffsetHours(date, timezone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  }).formatToParts(date);

  const tz = parts.find((p) => p.type === "timeZoneName").value;
  return Number(tz.replace("GMT", ""));
}

const shift = getLocalOffsetHours(date, "America/New_York");
const zmanim = calculateZmanInputs(day, shift, nyLatitude, nyLongitude);
```

---

## 📚 משאבים נוספים

### ספריות מומלצות:

- **@hebcal/core** - חישובי לוח שנה עברי
- **leaflet** - מפות אינטראקטיביות
- **date-fns** - עבודה עם תאריכים

### קבצים נוספים נדרשים:

1. **parasha.js** - חישוב פרשת השבוע (קובץ מורכב, נדרש מהפרויקט המקורי)
2. **israelDst.js** - חישוב שעון קיץ בישראל

---

## ⚠️ הערות חשובות

1. **דיוק**: החישובים מבוססים על נוסחאות אסטרונומיות מדויקות
2. **אזור זמן**: יש להתאים את חישובי אזור הזמן למיקום הספציפי
3. **שעות זמניות**: החישובים כוללים הן גר"א והן מג"א
4. **שבת**: זמני שבת מחושבים אוטומטית לפי יום השבוע
5. **פרשה**: חישוב פרשת השבוע מורכב ודורש את הקובץ המלא

---

## 🚀 התחלה מהירה

1. העתק את הפונקציות הבסיסיות
2. התקן את התלויות הנדרשות
3. התאם את אזור הזמן למיקום שלך
4. התחל לפתח את הממשק שלך

**בהצלחה בבניית אפליקציית זמני התפילה שלך! 🕐**
