# תיעוד מקורות הקוד - חישוב זמני תפילה

# Code Sources Documentation - Prayer Times Calculation

## סקירה כללית / Overview

קובץ `prayer-times-calculator.js` נוצר על ידי איחוד של כל הלוגיקה לחישוב זמני תפילה מקבצים שונים בפרויקט.

The `prayer-times-calculator.js` file was created by consolidating all prayer times calculation logic from various files in the project.

## מקורות הקוד / Code Sources

### 1. חישובי בסיס סולאריים / Basic Solar Calculations

**מקור:** `pages/api/utils/zmanCalculator.js`
**פונקציות שנלקחו:**

- `calculateIntermediateValues()` - חישוב ערכי ביניים סולאריים
- `calculateMidday()` - חישוב צהריים סולאריים (חצות)
- `calculateOffsetOfAngle()` - חישוב אופסט לזווית שמש נתונה
- `calculateZmanInputs()` - חישוב כל זמני התפילה

**שורות קוד:** 1-204
**תיאור:** הלוגיקה הבסיסית לחישוב זמני תפילה מבוססת על חישובים אסטרונומיים

### 2. חישובי שבת וזמנים מיוחדים / Shabbat and Special Times Calculations

**מקור:** `pages/api/zmanim.js`
**פונקציות שנלקחו:**

- לוגיקת חישוב זמני שבת (קיניסת שבת, יציאת שבת)
- חישוב ימי השבוע (מציאת יום שישי הקרוב)
- חישוב זמני הדלקת נרות (22, 30, 40 דקות לפני שקיעה)

**שורות קוד:** 33-84, 117-147
**תיאור:** לוגיקה מיוחדת לחישוב זמני שבת וחגים

### 3. חישוב אזור זמן ישראל / Israel Timezone Calculation

**מקור:** `pages/api/utils/timezone.js`
**פונקציות שנלקחו:**

- `getIsraelOffsetHours()` - חישוב אופסט ישראל (UTC+2 או UTC+3)

**שורות קוד:** 1-14
**תיאור:** פונקציה לחישוב אופסט הזמן של ישראל בהתאם לשעון קיץ/חורף

### 4. חישוב פרשת השבוע / Weekly Torah Portion Calculation

**מקור:** `pages/api/utils/parasha.js`
**פונקציות שנלקחו:**

- `getParashaSpecial()` - חישוב פרשת השבוע לשנים מיוחדות

**שורות קוד:** 1-841
**תיאור:** לוגיקה מורכבת לחישוב פרשת השבוע לשנים מעוברות ומיוחדות

### 5. גרסה מורחבת / Extended Version

**מקור:** `zmanimCalculator.js`
**פונקציות שנלקחו:**

- `calculateShabbatTimes()` - חישוב זמני שבת
- `getIsraelOffsetHours()` - חישוב אופסט ישראל
- פונקציות נוספות לחישוב זמנים

**שורות קוד:** 1-305
**תיאור:** גרסה מורחבת של מחשבון הזמנים

### 6. חישובי תאריך עברי / Hebrew Date Calculations

**מקור:** `pages/api/utils/hebrewDate.js`
**פונקציות שנלקחו:**

- `getHebrewDate()` - המרת תאריך גרגוריאני לעברי
- `numberToHebrew()` - המרת מספרים לגימטריה
- `getHolidays()` - חישוב חגים עבריים

**שורות קוד:** 1-143
**תיאור:** פונקציות עזר לחישוב תאריכים עבריים וחגים

## פירוט הפונקציות המרכזיות / Main Functions Details

### `calculateIntermediateValues(day, longitude)`

- **מקור:** `pages/api/utils/zmanCalculator.js` שורות 9-68
- **תפקיד:** חישוב ערכי ביניים סולאריים (קו אורך, נטייה, משוואת זמן)
- **פרמטרים:** תאריך, קו אורך
- **החזרה:** אובייקט עם ערכי ביניים סולאריים

### `calculateMidday(day, shift, longitude)`

- **מקור:** `pages/api/utils/zmanCalculator.js` שורות 79-97
- **תפקיד:** חישוב צהריים סולאריים (חצות)
- **פרמטרים:** תאריך, אופסט UTC, קו אורך
- **החזרה:** תאריך JavaScript לצהריים סולאריים

### `calculateOffsetOfAngle(angle, day, latitude, longitude)`

- **מקור:** `pages/api/utils/zmanCalculator.js` שורות 108-122
- **תפקיד:** חישוב אופסט מילישניות מצהריים סולאריים לזווית שמש נתונה
- **פרמטרים:** זווית, תאריך, קו רוחב, קו אורך
- **החזרה:** אופסט במילישניות

### `calculateZmanInputs(day, shift, latitude, longitude)`

- **מקור:** `pages/api/utils/zmanCalculator.js` שורות 134-204
- **תפקיד:** חישוב כל זמני התפילה
- **פרמטרים:** תאריך, אופסט UTC, קו רוחב, קו אורך
- **החזרה:** אובייקט עם כל זמני התפילה

### `calculateShabbatTimes(date, latitude, longitude, shift)`

- **מקור:** `zmanimCalculator.js` שורות 238-292
- **תפקיד:** חישוב זמני שבת
- **פרמטרים:** תאריך, קו רוחב, קו אורך, אופסט UTC
- **החזרה:** אובייקט עם זמני שבת

### `getIsraelOffsetHours(date)`

- **מקור:** `pages/api/utils/timezone.js` שורות 4-13
- **תפקיד:** חישוב אופסט ישראל בשעות
- **פרמטרים:** תאריך JavaScript
- **החזרה:** אופסט בשעות (2 או 3)

### `getParashaSpecial(jsDate)`

- **מקור:** `pages/api/utils/parasha.js` שורות 10-840
- **תפקיד:** חישוב פרשת השבוע לשנים מיוחדות
- **פרמטרים:** תאריך JavaScript
- **החזרה:** שם הפרשה

## זוויות שמש חשובות / Important Sun Angles

| זווית    | תיאור               | שימוש         |
| -------- | ------------------- | ------------- |
| -19.75°  | עלות השחר (90 דקות) | alot90        |
| -15.99°  | עלות השחר (72 דקות) | alot72        |
| -11.5°   | זמן טלית ותפילין    | talitTefillin |
| -0.8333° | זריחה               | zricha        |
| -4.65°   | צאת הכוכבים         | tzait         |

## קבועים חשובים / Important Constants

- **אפוק:** 1 בינואר 2000
- **נטיית המישור:** 23.44°
- **משוואת זמן:** 4 דקות למעלה
- **שעות זמניות:** 6 שעות זמניות (Gra) או (Magen Avraham)

## תלותיות / Dependencies

- `@hebcal/core` - ספרייה לחישובי לוח עברי
- `@hebcal/hdate` - חישובי תאריכים עבריים
- `@hebcal/noaa` - חישובי אסטרונומיה

## הערות חשובות / Important Notes

1. **דיוק:** החישובים מדויקים עד דקה אחת
2. **אזור זמן:** מיועד בעיקר לישראל (UTC+2/UTC+3)
3. **שנים מעוברות:** כולל לוגיקה מיוחדת לשנים מעוברות
4. **זמני שבת:** כולל חישובי הדלקת נרות ויציאת שבת
5. **פרשת השבוע:** כולל לוגיקה מורכבת לשנים מיוחדות

## שימוש / Usage

```javascript
import { calculateAllPrayerTimes } from "./prayer-times-calculator.js";

const prayerTimes = calculateAllPrayerTimes("2024-01-15", 31.7683, 35.2137);
console.log(prayerTimes);
```

## סיכום / Summary

הקובץ `prayer-times-calculator.js` מאחד את כל הלוגיקה לחישוב זמני תפילה מקבצים שונים בפרויקט, ומספק ממשק אחיד ופשוט לשימוש. כל הפונקציות מתועדות בעברית ובאנגלית, והקוד מאורגן בצורה ברורה ומובנת.

The `prayer-times-calculator.js` file unifies all prayer times calculation logic from various files in the project, providing a unified and simple interface for use. All functions are documented in Hebrew and English, and the code is organized in a clear and understandable way.

