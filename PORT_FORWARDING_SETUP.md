# Port Forwarding Setup Guide - זמני תפילה

## 🌐 מידע נוכחי
- **כתובת IP ציבורית**: `199.203.91.130`
- **כתובת IP מקומית**: `192.168.20.32`
- **פורט האפליקציה**: `3333`
- **סטטוס**: ✅ עובד ברשת מקומית, ❌ לא עובד מהאינטרנט

## 🔧 שלב 1: כניסה לנתב

### אפשרויות כתובות נתב נפוצות:
1. `http://192.168.20.1` (הכי סביר בהתבסס על ה-IP שלך)
2. `http://192.168.1.1`
3. `http://192.168.0.1`
4. `http://10.0.0.1`

### מציאת כתובת הנתב:
```cmd
ipconfig | findstr "Default Gateway"
```

## 🔧 שלב 2: התחברות לנתב

1. פתח דפדפן ועבור לכתובת הנתב
2. התחבר עם:
   - **שם משתמש**: `admin`
   - **סיסמה**: `admin` או הסיסמה שעל המדבקה של הנתב

### נתבים נפוצים בישראל:
- **בזק/נטוויז'ן**: admin/admin או admin/[סיסמה על המדבקה]
- **הוט**: admin/admin
- **פרטנר**: admin/admin
- **סלקום**: admin/admin

## 🔧 שלב 3: הגדרת Port Forwarding

### מיקום ההגדרות (תלוי בדגם הנתב):
- **Advanced** → **Port Forwarding**
- **Network** → **Port Forwarding**
- **NAT** → **Virtual Server**
- **Firewall** → **Port Forwarding**
- **Applications & Gaming** → **Port Range Forward**

### הגדרות שצריך להזין:
```
Service Name: Zmanim App
Internal IP: 192.168.20.32
Internal Port: 3333
External Port: 3333
Protocol: TCP
Status: Enabled
```

## 🔧 שלב 4: הגדרות נוספות נדרשות

### A. הגדרת DHCP Reservation (מומלץ):
1. עבור ל-**DHCP Settings** או **LAN Setup**
2. מצא את המחשב שלך (`192.168.20.32`)
3. הגדר **Static IP** או **DHCP Reservation**
4. זה יוודא שה-IP לא ישתנה

### B. הגדרת Windows Firewall (דרוש הרשאות Admin):
```powershell
# הרץ כ-Administrator
New-NetFirewallRule -DisplayName "Zmanim Port 3333" -Direction Inbound -Protocol TCP -LocalPort 3333 -Action Allow
New-NetFirewallRule -DisplayName "Node.js Inbound" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

## 🔧 שלב 5: בדיקת החיבור

### בדיקה מקומית:
```cmd
# בדיקה שהשרת רץ
netstat -ano | findstr :3333

# בדיקה שהפורט פתוח מקומית
Test-NetConnection -ComputerName 192.168.20.32 -Port 3333
```

### בדיקה מהאינטרנט:
```cmd
# בדיקה מהמחשב שלך (לא תעבוד עד שהנתב יוגדר)
Test-NetConnection -ComputerName 199.203.91.130 -Port 3333
```

### בדיקה עם כלים חיצוניים:
- **אתר בדיקת פורטים**: https://www.yougetsignal.com/tools/open-ports/
- **הזן**: `199.203.91.130` ופורט `3333`

## 🔧 שלב 6: הפעלת השרת

```bash
cd "C:\Users\nihul yeda\Downloads\zmanim-refactored-main\zmanim-refactored-main"
npm run dev
```

השרת יהיה זמין ב:
- **מקומי**: http://localhost:3333
- **רשת מקומית**: http://192.168.20.32:3333
- **אינטרנט**: http://199.203.91.130:3333

## 🚨 פתרון בעיות נפוצות

### בעיה 1: לא מוצא את הנתב
```cmd
# מצא את כתובת הנתב
ipconfig | findstr "Default Gateway"
arp -a | findstr "192.168"
```

### בעיה 2: הנתב לא מקבל את הסיסמה
- בדוק את המדבקה על הנתב
- נסה לאפס את הנתב (כפתור Reset)
- התקשר לספק האינטרנט

### בעיה 3: הפורט עדיין חסום
```cmd
# בדוק שהשרת רץ
netstat -ano | findstr :3333

# בדוק שאין תוכנות אנטי-וירוס שחוסמות
# השבת זמנית את Windows Defender Firewall (לבדיקה בלבד)
```

### בעיה 4: הספק חוסם פורטים
- נסה פורט אחר (8080, 8443, 5000)
- עדכן את `package.json`: `"dev": "next dev -p 8080 -H 0.0.0.0"`
- עדכן את הגדרות הנתב בהתאם

## 📞 תמיכה

אם אתה נתקל בבעיות:
1. צלם screenshot של הגדרות הנתב
2. הרץ את הפקודות הבאות ושלח את התוצאות:

```cmd
ipconfig /all
netstat -ano | findstr :3333
Test-NetConnection -ComputerName 192.168.20.32 -Port 3333
Test-NetConnection -ComputerName 199.203.91.130 -Port 3333
```

## 🎯 מטרה סופית

לאחר השלמת כל השלבים, האפליקציה תהיה זמינה מכל מקום בעולם בכתובת:
**http://199.203.91.130:3333** 