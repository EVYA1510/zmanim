# פריסה ב-v0 - הוראות מפורטות

## שלב 1: הכנת הפרויקט

✅ הפרויקט מוכן לפריסה!

- כל הקבצים המיותרים נמחקו
- הפרויקט נבנה בהצלחה
- קבצי התצורה מותאמים לפריסה

## שלב 2: פריסה ב-v0

### אפשרות 1: פריסה ישירה מ-GitHub

1. **העלה את הפרויקט ל-GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit - ready for v0 deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/zmanim-calculator.git
   git push -u origin main
   ```

2. **פרוס ב-v0:**
   - לך ל-[v0.dev](https://v0.dev)
   - לחץ על "Deploy"
   - בחר "Import from GitHub"
   - בחר את הפרויקט שלך
   - לחץ על "Deploy"

### אפשרות 2: פריסה מ-Vercel

1. **התחבר ל-Vercel:**

   - לך ל-[vercel.com](https://vercel.com)
   - התחבר עם GitHub

2. **פרוס את הפרויקט:**
   - לחץ על "New Project"
   - בחר את הפרויקט מ-GitHub
   - Vercel יזהה אוטומטית שזה Next.js
   - לחץ על "Deploy"

## שלב 3: הגדרות נוספות

### משתני סביבה (אם נדרש)

אם יש צורך במשתני סביבה, הוסף אותם ב-Vercel:

- לך ל-Dashboard של הפרויקט
- Settings > Environment Variables
- הוסף משתנים לפי הצורך

### דומיין מותאם אישית

- Settings > Domains
- הוסף דומיין מותאם אישית

## בדיקות אחרי הפריסה

1. **בדוק שהאתר עובד:**

   - פתח את ה-URL שקיבלת
   - בדוק שכל הדפים נטענים
   - בדוק את חישובי הזמנים

2. **בדוק את ה-API:**

   - בדוק שהנתיבים `/api/zmanim` עובדים
   - בדוק חישובי תאריכים עבריים

3. **בדוק רספונסיביות:**
   - בדוק על מובייל
   - בדוק על טאבלט

## פתרון בעיות נפוצות

### שגיאת Build

- בדוק שהכל עובד מקומית: `npm run build`
- בדוק את הלוגים ב-Vercel

### בעיות API

- בדוק שהקבצים ב-`pages/api/` קיימים
- בדוק שהפונקציות מחזירות תגובה תקינה

### בעיות CSS

- בדוק ש-Tailwind CSS מוגדר נכון
- בדוק את `tailwind.config.js`

## קישורים שימושיים

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [v0.dev Documentation](https://v0.dev/docs)

---

**הפרויקט מוכן לפריסה! 🚀**
