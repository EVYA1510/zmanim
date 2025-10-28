# 🎯 הוראות שימוש עם Cursor - Zmanim Calculator

## 📋 מה קיבלת?

1. **`ZMANIM_CALCULATIONS_GUIDE.md`** - מדריך מפורט עם כל החישובים וההסברים
2. **`zmanimCalculator.js`** - קובץ JavaScript מוכן לשימוש עם כל הפונקציות
3. **`CURSOR_USAGE_INSTRUCTIONS.md`** - הוראות שימוש מפורטות (הקובץ הזה)

---

## 🚀 התחלה מהירה

### 1. העתק את הקבצים לפרויקט החדש שלך

```bash
# העתק את הקבצים לפרויקט שלך
cp ZMANIM_CALCULATIONS_GUIDE.md /path/to/your/project/
cp zmanimCalculator.js /path/to/your/project/
```

### 2. התקן תלויות נדרשות

```bash
npm install @hebcal/core
```

### 3. ייבא את הקובץ בפרויקט שלך

```javascript
// import כל הפונקציות
import {
  calculateZmanInputs,
  calculateShabbatTimes,
  getIsraelOffsetHours,
  ZMANIM_LABELS,
  TIME_GROUPS,
} from "./zmanimCalculator.js";

// או import הכל
import ZmanimCalculator from "./zmanimCalculator.js";
```

---

## 💻 דוגמאות קוד מעשיות

### דוגמה 1: חישוב זמני תפילה בסיסי

```javascript
import {
  calculateZmanInputs,
  getIsraelOffsetHours,
  formatZman,
} from "./zmanimCalculator.js";

// נתונים לירושלים
const latitude = 31.7683;
const longitude = -35.2137;
const date = "2024-01-15";

// חישוב הזמנים
const day = new Date(date + "T00:00:00.000Z");
const shift = getIsraelOffsetHours(day);
const zmanim = calculateZmanInputs(day, shift, latitude, longitude);

// הדפסה
console.log("זריחה:", formatZman(zmanim.zricha));
console.log("שקיעה:", formatZman(zmanim.shkiya));
console.log("חצות:", formatZman(zmanim.chatzot));
```

### דוגמה 2: חישוב זמני שבת

```javascript
import { calculateShabbatTimes, formatZman } from "./zmanimCalculator.js";

const shabbatTimes = calculateShabbatTimes(date, latitude, longitude, shift);

console.log("כניסת שבת (22 דק'):", formatZman(shabbatTimes.kenisatShabbat22));
console.log("יציאת שבת:", formatZman(shabbatTimes.yetziatShabbat));
```

### דוגמה 3: שימוש עם מיקום אחר (ניו יורק)

```javascript
import {
  calculateZmanInputs,
  getLocalOffsetHours,
} from "./zmanimCalculator.js";

// נתונים לניו יורק
const nyLatitude = 40.7128;
const nyLongitude = 74.006;
const nyTimezone = "America/New_York";

const shift = getLocalOffsetHours(day, nyTimezone);
const zmanim = calculateZmanInputs(day, shift, nyLatitude, nyLongitude);
```

### דוגמה 4: שימוש עם React/Next.js

```javascript
// components/ZmanimDisplay.jsx
import React, { useState, useEffect } from "react";
import { calculateZmanimExample, ZMANIM_LABELS } from "../zmanimCalculator.js";

export default function ZmanimDisplay({ latitude, longitude, date }) {
  const [zmanim, setZmanim] = useState(null);

  useEffect(() => {
    const result = calculateZmanimExample(latitude, longitude, date);
    setZmanim(result);
  }, [latitude, longitude, date]);

  if (!zmanim) return <div>טוען...</div>;

  return (
    <div>
      <h3>זמני התפילה</h3>
      <p>
        {ZMANIM_LABELS.he.zricha}: {zmanim.formatted.zricha}
      </p>
      <p>
        {ZMANIM_LABELS.he.shkiya}: {zmanim.formatted.shkiya}
      </p>
      <p>
        {ZMANIM_LABELS.he.chatzot}: {zmanim.formatted.chatzot}
      </p>
    </div>
  );
}
```

### דוגמה 5: API Route (Next.js)

```javascript
// pages/api/zmanim.js
import {
  calculateZmanInputs,
  calculateShabbatTimes,
  getIsraelOffsetHours,
} from "../../zmanimCalculator.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { latitude, longitude, date } = req.body;

  try {
    const day = new Date(date + "T00:00:00.000Z");
    const shift = getIsraelOffsetHours(day);

    const zmanim = calculateZmanInputs(day, shift, latitude, longitude);
    const shabbatTimes = calculateShabbatTimes(
      date,
      latitude,
      longitude,
      shift
    );

    res.status(200).json({
      ...zmanim,
      ...shabbatTimes,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## 🛠️ התאמה לפרויקט שלך

### 1. התאמת אזור זמן

```javascript
// אם אתה לא בישראל, השתמש בפונקציה זו:
import { getLocalOffsetHours } from "./zmanimCalculator.js";

// דוגמאות לאזורי זמן שונים:
const timezones = {
  "New York": "America/New_York",
  London: "Europe/London",
  Paris: "Europe/Paris",
  Tokyo: "Asia/Tokyo",
  Sydney: "Australia/Sydney",
  "Los Angeles": "America/Los_Angeles",
};

const shift = getLocalOffsetHours(day, timezones["New York"]);
```

### 2. התאמת שפה

```javascript
// השתמש בכותרות המוכנות או הוסף שפות נוספות
import { ZMANIM_LABELS, TIME_GROUPS } from "./zmanimCalculator.js";

// דוגמה לשימוש בעברית
const labels = ZMANIM_LABELS.he;
const groups = TIME_GROUPS.he;

// דוגמה לשימוש באנגלית
const labels = ZMANIM_LABELS.en;
const groups = TIME_GROUPS.en;
```

### 3. התאמת פורמט תאריכים

```javascript
// אם אתה משתמש בפורמט תאריך אחר
function convertDateFormat(dateString) {
  // המר מפורמט שלך ל-YYYY-MM-DD
  return dateString; // או לוגיקה המרה
}

const formattedDate = convertDateFormat(yourDateString);
const zmanim = calculateZmanInputs(new Date(formattedDate), shift, lat, lng);
```

---

## 🎨 דוגמאות UI

### כרטיס זמני בוקר

```jsx
function MorningTimesCard({ zmanim, labels }) {
  return (
    <div className="card">
      <h4>{labels.morningTimes}</h4>
      <div className="time-item">
        <span>{labels.alot90}:</span>
        <span>{formatZman(zmanim.alot90)}</span>
      </div>
      <div className="time-item">
        <span>{labels.zricha}:</span>
        <span>{formatZman(zmanim.zricha)}</span>
      </div>
      <div className="time-item">
        <span>{labels.sofShemaGRA}:</span>
        <span>{formatZman(zmanim.sofZmanShemaGRA)}</span>
      </div>
    </div>
  );
}
```

### רשימת זמנים מלאה

```jsx
function ZmanimList({ zmanim, labels }) {
  const morningTimes = [
    { key: "alot90", label: labels.alot90 },
    { key: "alot72", label: labels.alot72 },
    { key: "talitTefillin", label: labels.talitTefillin },
    { key: "zricha", label: labels.zricha },
  ];

  const dayTimes = [
    { key: "chatzot", label: labels.chatzot },
    { key: "minchaGedola", label: labels.minchaGedola },
    { key: "minchaKetana", label: labels.minchaKetana },
    { key: "shkiya", label: labels.shkiya },
  ];

  return (
    <div className="zmanim-container">
      <div className="time-group">
        <h3>{labels.morningTimes}</h3>
        {morningTimes.map((item) => (
          <div key={item.key} className="time-row">
            <span>{item.label}:</span>
            <span>{formatZman(zmanim[item.key])}</span>
          </div>
        ))}
      </div>

      <div className="time-group">
        <h3>{labels.dayTimes}</h3>
        {dayTimes.map((item) => (
          <div key={item.key} className="time-row">
            <span>{item.label}:</span>
            <span>{formatZman(zmanim[item.key])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔧 פתרון בעיות נפוצות

### בעיה 1: שגיאות import

```javascript
// אם אתה משתמש ב-CommonJS במקום ES6 modules:
const ZmanimCalculator = require('./zmanimCalculator.js');

// או הוסף ל-package.json:
{
  "type": "module"
}
```

### בעיה 2: חישובים לא מדויקים

```javascript
// וודא שאתה משתמש בקורדינאטות נכונות:
// ירושלים: lat: 31.7683, lng: -35.2137
// ניו יורק: lat: 40.7128, lng: -74.0060
// לונדון: lat: 51.5074, lng: -0.1278

// וודא שאתה משתמש באזור זמן נכון
const shift = getLocalOffsetHours(day, "America/New_York");
```

### בעיה 3: תאריכים לא נכונים

```javascript
// וודא שהתאריך בפורמט נכון
const date = "2024-01-15"; // YYYY-MM-DD
const day = new Date(date + "T00:00:00.000Z");
```

---

## 📱 דוגמאות לפרויקטים שונים

### React Native

```javascript
import {
  calculateZmanInputs,
  getLocalOffsetHours,
} from "./zmanimCalculator.js";

// ב-React Native, השתמש ב-import רגיל
const zmanim = calculateZmanInputs(day, shift, latitude, longitude);
```

### Vue.js

```javascript
// components/ZmanimCalculator.vue
<script>
import { calculateZmanInputs } from '../zmanimCalculator.js';

export default {
  data() {
    return {
      zmanim: null
    }
  },
  methods: {
    calculateZmanim() {
      this.zmanim = calculateZmanInputs(day, shift, lat, lng);
    }
  }
}
</script>
```

### Node.js Backend

```javascript
// server.js
const express = require("express");
const { calculateZmanInputs } = require("./zmanimCalculator.js");

app.post("/api/zmanim", (req, res) => {
  const { latitude, longitude, date } = req.body;
  const zmanim = calculateZmanInputs(day, shift, latitude, longitude);
  res.json(zmanim);
});
```

---

## 🎯 טיפים לשימוש יעיל

1. **שמור על קאש**: חשב זמנים פעם אחת ותשמור בתוצאה
2. **השתמש ב-Web Workers**: לחישובים כבדים
3. **בדוק תקינות קלטים**: וודא קורדינאטות ותאריכים תקינים
4. **הוסף טיפול בשגיאות**: לכל הפונקציות
5. **בדוק דיוק**: השווה עם מקורות אחרים לזמנים מדויקים

---

## 📞 תמיכה

אם אתה נתקל בבעיות:

1. בדוק את הקונסול לשגיאות JavaScript
2. וודא שהקורדינאטות נכונות
3. בדוק שאזור הזמן נכון
4. השווה עם חישובים ידניים

**בהצלחה בבניית אפליקציית זמני התפילה שלך! 🕐**
