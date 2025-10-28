# 🕐 Zmanim Calculator - Complete Package for Cursor

## 📦 מה יש כאן?

זהו חבילה מלאה לחישוב זמני התפילה היהודיים, מוכנה לשימוש עם Cursor או כל IDE אחר. החישובים מבוססים על נוסחאות אסטרונומיות מדויקות ומתאימים לכל מיקום גיאוגרפי בעולם.

## 📁 קבצים בחבילה

| קובץ                           | תיאור                                             |
| ------------------------------ | ------------------------------------------------- |
| `zmanimCalculator.js`          | **הקובץ הראשי** - כל הפונקציות לחישוב זמני התפילה |
| `ZMANIM_CALCULATIONS_GUIDE.md` | מדריך מפורט עם כל החישובים וההסברים               |
| `CURSOR_USAGE_INSTRUCTIONS.md` | הוראות שימוש מפורטות עם דוגמאות קוד               |
| `package-example.json`         | דוגמה ל-package.json לפרויקט חדש                  |
| `test-zmanim.js`               | קובץ בדיקה לדוגמה                                 |
| `README_FOR_CURSOR.md`         | הקובץ הזה - הוראות מהירות                         |

## 🚀 התחלה מהירה (5 דקות)

### 1. העתק קבצים לפרויקט חדש

```bash
mkdir my-zmanim-app
cd my-zmanim-app
# העתק את הקבצים לכאן
```

### 2. התקן תלויות

```bash
npm install @hebcal/core
```

### 3. צור קובץ test.js

```javascript
import { calculateZmanimExample } from "./zmanimCalculator.js";

// חישוב זמני תפילה לירושלים
const result = calculateZmanimExample(31.7683, -35.2137, "2024-01-15");
console.log("זריחה:", result.formatted.zricha);
console.log("שקיעה:", result.formatted.shkiya);
```

### 4. הרץ את הבדיקה

```bash
node test.js
```

## 💻 דוגמת קוד בסיסית

```javascript
import {
  calculateZmanInputs,
  getIsraelOffsetHours,
  formatZman,
  ZMANIM_LABELS,
} from "./zmanimCalculator.js";

// נתונים
const latitude = 31.7683; // ירושלים
const longitude = -35.2137;
const date = "2024-01-15";

// חישוב
const day = new Date(date + "T00:00:00.000Z");
const shift = getIsraelOffsetHours(day);
const zmanim = calculateZmanInputs(day, shift, latitude, longitude);

// הצגה
console.log(`${ZMANIM_LABELS.he.zricha}: ${formatZman(zmanim.zricha)}`);
console.log(`${ZMANIM_LABELS.he.shkiya}: ${formatZman(zmanim.shkiya)}`);
console.log(`${ZMANIM_LABELS.he.chatzot}: ${formatZman(zmanim.chatzot)}`);
```

## 🌍 מיקומים פופולריים

```javascript
const LOCATIONS = {
  jerusalem: { lat: 31.7683, lng: -35.2137, timezone: "Asia/Jerusalem" },
  newYork: { lat: 40.7128, lng: -74.006, timezone: "America/New_York" },
  london: { lat: 51.5074, lng: -0.1278, timezone: "Europe/London" },
  paris: { lat: 48.8566, lng: -2.3522, timezone: "Europe/Paris" },
  tokyo: { lat: 35.6762, lng: -139.6503, timezone: "Asia/Tokyo" },
  sydney: { lat: -33.8688, lng: 151.2093, timezone: "Australia/Sydney" },
};
```

## 📱 דוגמאות לפרויקטים

### React Component

```jsx
import React, { useState, useEffect } from "react";
import {
  calculateZmanInputs,
  getLocalOffsetHours,
  formatZman,
} from "./zmanimCalculator.js";

function ZmanimDisplay({ lat, lng, date }) {
  const [zmanim, setZmanim] = useState(null);

  useEffect(() => {
    const day = new Date(date + "T00:00:00.000Z");
    const shift = getLocalOffsetHours(day, "Asia/Jerusalem");
    const result = calculateZmanInputs(day, shift, lat, lng);
    setZmanim(result);
  }, [lat, lng, date]);

  return zmanim ? (
    <div>
      <h3>זמני התפילה</h3>
      <p>זריחה: {formatZman(zmanim.zricha)}</p>
      <p>שקיעה: {formatZman(zmanim.shkiya)}</p>
      <p>חצות: {formatZman(zmanim.chatzot)}</p>
    </div>
  ) : (
    <div>טוען...</div>
  );
}
```

### API Route (Next.js)

```javascript
// pages/api/zmanim.js
import {
  calculateZmanInputs,
  getLocalOffsetHours,
} from "../../zmanimCalculator.js";

export default function handler(req, res) {
  const { latitude, longitude, date } = req.body;

  const day = new Date(date + "T00:00:00.000Z");
  const shift = getLocalOffsetHours(day, "Asia/Jerusalem");
  const zmanim = calculateZmanInputs(day, shift, latitude, longitude);

  res.json(zmanim);
}
```

## 🎯 זמני התפילה הזמינים

### זמני בוקר

- עלות השחר (90 דק')
- עלות השחר (72 דק')
- טלית ותפילין
- זריחה
- סוף זמן קריאת שמע (גר"א/מג"א)
- סוף זמן תפילה (גר"א/מג"א)

### זמני יום

- חצות היום
- מנחה גדולה
- מנחה קטנה
- שקיעה

### זמני ערב

- צאת הכוכבים
- חצות הלילה

### זמני שבת

- כניסת שבת (22/30/40 דק')
- יציאת שבת

## 🔧 פתרון בעיות

### שגיאות נפוצות:

1. **Import errors**: וודא שאתה משתמש ב-ES6 modules
2. **Timezone errors**: בדוק שהאזור זמן נכון
3. **Date format**: השתמש בפורמט YYYY-MM-DD

### בדיקה מהירה:

```bash
node test-zmanim.js
```

## 📚 משאבים נוספים

- `ZMANIM_CALCULATIONS_GUIDE.md` - מדריך מפורט
- `CURSOR_USAGE_INSTRUCTIONS.md` - הוראות מפורטות
- `test-zmanim.js` - דוגמאות בדיקה

## ⚡ התחלה מהירה עם Cursor

1. **פתח פרויקט חדש**
2. **העתק את `zmanimCalculator.js`**
3. **התקן**: `npm install @hebcal/core`
4. **העתק דוגמת קוד** מהסעיף "דוגמת קוד בסיסית"
5. **הרץ**: `node your-file.js`

## 🎉 מוכן לשימוש!

החבילה כוללת:

- ✅ חישובים אסטרונומיים מדויקים
- ✅ תמיכה בכל המיקומים בעולם
- ✅ זמני שבת אוטומטיים
- ✅ כותרות בעברית ואנגלית
- ✅ דוגמאות קוד מוכנות
- ✅ בדיקות אוטומטיות
- ✅ תיעוד מפורט

**בהצלחה בבניית אפליקציית זמני התפילה שלך! 🕐**
