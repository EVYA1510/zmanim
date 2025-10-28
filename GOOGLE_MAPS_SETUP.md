# הגדרת Google Maps API

## שלב 1: קבלת API Key

1. עבור לקונסול של Google Cloud: https://console.cloud.google.com/
2. צור פרויקט חדש או בחר פרויקט קיים
3. הפעל את השירותים הבאים:
   - Maps JavaScript API
   - Places API (New)
   - Geocoding API

4. צור API Key:
   - עבור ל-"Credentials" בתפריט הצד
   - לחץ על "Create Credentials" > "API Key"
   - העתק את ה-API Key

## שלב 2: הגדרת הפרויקט

1. פתח את הקובץ `pages/index.js`
2. מצא את השורה:
   ```javascript
   script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&language=${currentLanguage}`;
   ```

3. החלף את `YOUR_GOOGLE_MAPS_API_KEY` עם ה-API Key שלך:
   ```javascript
   script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmxjMVDMo1oaJYu8SDJrh_KdKs&libraries=places&language=${currentLanguage}`;
   ```

## שלב 3: הגבלת השימוש (מומלץ)

1. בקונסול Google Cloud, עבור ל-"Credentials"
2. לחץ על ה-API Key שיצרת
3. תחת "API restrictions", בחר "Restrict key"
4. בחר את השירותים הבאים:
   - Maps JavaScript API
   - Places API (New)
   - Geocoding API

5. תחת "Application restrictions", בחר "HTTP referrers" והוסף:
   - `http://localhost:3000/*`
   - `http://localhost:3001/*`
   - `http://localhost:3002/*`
   - `http://localhost:3003/*`
   - `http://localhost:3004/*`
   - הדומיין שלך בייצור

## שלב 4: בדיקה

1. הפעל את השרת: `npm run dev`
2. פתח את האפליקציה בדפדפן
3. נסה לחפש עיר בתיבת החיפוש
4. וודא שמופיעות הצעות מ-Google Maps

## בעיות נפוצות

### שגיאת "This API project is not authorized"
- וודא שה-API מופעל בפרויקט שלך
- בדוק שה-API Key נכון

### אין הצעות בחיפוש
- וודא שהשרת רץ על HTTPS או localhost
- בדוק את ה-Console בדפדפן לשגיאות

### שגיאת "RefererNotAllowedMapError"
- הוסף את הדומיין שלך להגבלות ה-HTTP referrers

## מידע נוסף

- [תיעוד Google Maps API](https://developers.google.com/maps/documentation/javascript)
- [תיעוד Places API](https://developers.google.com/maps/documentation/places/web-service)
- [מחירון Google Maps](https://cloud.google.com/maps-platform/pricing)

**הערה**: Google נותן 200$ קרדיט חינם בחודש הראשון ו-200$ קרדיט חודשי לשימוש ב-Maps API. 