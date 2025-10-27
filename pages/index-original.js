// pages/index.js - Modern Prayer Times Calculator
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { isIsraelDST } from "./api/utils/israelDst";
import { getHebrewDate } from "./api/utils/hebrewDate";

// Import modern components
import PrayerTimeCard from "../components/PrayerTimeCard";
import LocationSelector from "../components/LocationSelector";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { ThemeProvider } from "../components/ThemeProvider";
import ThemeToggle from "../components/ThemeToggle";

// Import Map component dynamically to avoid SSR issues with Leaflet
const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div style={{ textAlign: "center", padding: "20px" }}>טוען מפה...</div>
  ),
});

const DEFAULT_LAT = 31.7683; // Jerusalem coordinates
const DEFAULT_LNG = -35.2137; // Jerusalem coordinates - reversed for calculation

// Predefined cities for fallback - expanded list
const PREDEFINED_CITIES = [
  // Israel
  { name: "ירושלים, ישראל (UTC+2/+3)", lat: 31.7683, lng: -35.2137 },
  { name: "תל אביב, ישראל (UTC+2/+3)", lat: 32.0853, lng: -34.7818 },
  { name: "חיפה, ישראל (UTC+2/+3)", lat: 32.794, lng: -34.9896 },
  { name: "באר שבע, ישראל (UTC+2/+3)", lat: 31.2518, lng: -34.7915 },
  { name: "אילת, ישראל (UTC+2/+3)", lat: 29.5577, lng: -34.9519 },
  { name: "צפת, ישראל (UTC+2/+3)", lat: 32.9644, lng: -35.4962 },
  { name: "טבריה, ישראל (UTC+2/+3)", lat: 32.7922, lng: -35.5311 },
  { name: "נתניה, ישראל (UTC+2/+3)", lat: 32.3215, lng: -34.8532 },
  { name: "אשדוד, ישראל (UTC+2/+3)", lat: 31.794, lng: -34.6446 },
  { name: "פתח תקווה, ישראל (UTC+2/+3)", lat: 32.087, lng: -34.8879 },
  { name: "רמת גן, ישראל (UTC+2/+3)", lat: 32.0809, lng: -34.8243 },
  { name: "בני ברק, ישראל (UTC+2/+3)", lat: 32.0881, lng: -34.8216 },
  { name: "רחובות, ישראל (UTC+2/+3)", lat: 31.8947, lng: -34.8096 },
  { name: "הרצליה, ישראל (UTC+2/+3)", lat: 32.1624, lng: -34.8443 },
  { name: "כפר סבא, ישראל (UTC+2/+3)", lat: 32.1742, lng: -34.9063 },
  { name: "רעננה, ישראל (UTC+2/+3)", lat: 32.1847, lng: -34.8706 },
  { name: "אשקלון, ישראל (UTC+2/+3)", lat: 31.6688, lng: -34.5742 },
  { name: "חולון, ישראל (UTC+2/+3)", lat: 32.0114, lng: -34.7806 },
  { name: "בת ים, ישראל (UTC+2/+3)", lat: 32.0114, lng: -34.7506 },
  { name: "רמלה, ישראל (UTC+2/+3)", lat: 31.9295, lng: -34.8706 },
  { name: "מודיעין, ישראל (UTC+2/+3)", lat: 31.8969, lng: -35.0097 },
  { name: "קרית שמונה, ישראל (UTC+2/+3)", lat: 33.2074, lng: -35.5693 },
  { name: "עכו, ישראל (UTC+2/+3)", lat: 32.9342, lng: -35.0818 },
  { name: "יבנה, ישראל (UTC+2/+3)", lat: 31.8775, lng: -34.7414 },

  // USA - Major Jewish Communities
  { name: "ניו יורק, ארצות הברית (UTC-4/-5)", lat: 40.7128, lng: 74.006 },
  { name: "ברוקלין, ניו יורק (UTC-4/-5)", lat: 40.6782, lng: 73.9442 },
  { name: "מנהטן, ניו יורק (UTC-4/-5)", lat: 40.7831, lng: 73.9712 },
  { name: "לוס אנג'לס, ארצות הברית (UTC-7/-8)", lat: 34.0522, lng: 118.2437 },
  { name: "שיקגו, ארצות הברית (UTC-5/-6)", lat: 41.8781, lng: 87.6298 },
  { name: "מיאמי, ארצות הברית (UTC-4/-5)", lat: 25.7617, lng: 80.1918 },
  { name: "לאס וגאס, ארצות הברית (UTC-7/-8)", lat: 36.1699, lng: 115.1398 },
  { name: "סן פרנסיסקו, ארצות הברית (UTC-7/-8)", lat: 37.7749, lng: 122.4194 },
  { name: "בוסטון, ארצות הברית (UTC-4/-5)", lat: 42.3601, lng: 71.0589 },
  { name: "פילדלפיה, ארצות הברית (UTC-4/-5)", lat: 39.9526, lng: 75.1652 },
  { name: "דטרויט, ארצות הברית (UTC-4/-5)", lat: 42.3314, lng: 83.0458 },
  { name: "אטלנטה, ארצות הברית (UTC-4/-5)", lat: 33.749, lng: 84.388 },
  { name: "בולטימור, ארצות הברית (UTC-4/-5)", lat: 39.2904, lng: 76.6122 },
  {
    name: "וושינגטון די.סי, ארצות הברית (UTC-4/-5)",
    lat: 38.9072,
    lng: 77.0369,
  },
  { name: "דנבר, ארצות הברית (UTC-6/-7)", lat: 39.7392, lng: 104.9903 },

  // Europe - Major Jewish Communities
  { name: "לונדון, אנגליה (UTC+1/+0)", lat: 51.5074, lng: 0.1278 },
  { name: "מנצ'סטר, אנגליה (UTC+1/+0)", lat: 53.4808, lng: 2.2426 },
  { name: "פריז, צרפת (UTC+2/+1)", lat: 48.8566, lng: -2.3522 },
  { name: "מרסיי, צרפת (UTC+2/+1)", lat: 43.2965, lng: -5.3698 },
  { name: "ברלין, גרמניה (UTC+2/+1)", lat: 52.52, lng: -13.405 },
  { name: "מינכן, גרמניה (UTC+2/+1)", lat: 48.1351, lng: -11.582 },
  { name: "רומא, איטליה (UTC+2/+1)", lat: 41.9028, lng: -12.4964 },
  { name: "מילנו, איטליה (UTC+2/+1)", lat: 45.4642, lng: -9.19 },
  { name: "מדריד, ספרד (UTC+2/+1)", lat: 40.4168, lng: 3.7038 },
  { name: "ברצלונה, ספרד (UTC+2/+1)", lat: 41.3851, lng: -2.1734 },
  { name: "אמסטרדם, הולנד (UTC+2/+1)", lat: 52.3676, lng: -4.9041 },
  { name: "וינה, אוסטריה (UTC+2/+1)", lat: 48.2082, lng: -16.3738 },
  { name: "ציריך, שוויץ (UTC+2/+1)", lat: 47.3769, lng: -8.5417 },
  { name: "ז'נבה, שוויץ (UTC+2/+1)", lat: 46.2044, lng: -6.1432 },
  { name: "בודפשט, הונגריה (UTC+2/+1)", lat: 47.4979, lng: -19.0402 },
  { name: "פראג, צ'כיה (UTC+2/+1)", lat: 50.0755, lng: -14.4378 },
  { name: "אנטוורפן, בלגיה (UTC+2/+1)", lat: 51.2194, lng: -4.4025 },
  { name: "בריסל, בלגיה (UTC+2/+1)", lat: 50.8503, lng: -4.3517 },

  // Americas
  { name: "טורונטו, קנדה (UTC-4/-5)", lat: 43.6532, lng: 79.3832 },
  { name: "מונטריאול, קנדה (UTC-4/-5)", lat: 45.5017, lng: 73.5673 },
  { name: "ונקובר, קנדה (UTC-7/-8)", lat: 49.2827, lng: 123.1207 },
  { name: "מקסיקו סיטי, מקסיקו (UTC-5/-6)", lat: 19.4326, lng: 99.1332 },
  { name: "בואנוס איירס, ארגנטינה (UTC-3)", lat: -34.6118, lng: 58.396 },
  { name: "ריו דה ז'נירו, ברזיל (UTC-3)", lat: -22.9068, lng: 43.1729 },
  { name: "סאו פאולו, ברזיל (UTC-3)", lat: -23.5505, lng: 46.6333 },
  { name: "סנטיאגו, צ'ילה (UTC-3/-4)", lat: -33.4489, lng: 70.6693 },
  { name: "לימה, פרו (UTC-5)", lat: -12.0464, lng: 77.0428 },

  // Asia
  { name: "טוקיו, יפן (UTC+9)", lat: 35.6762, lng: -139.6503 },
  { name: "בייג'ינג, סין (UTC+8)", lat: 39.9042, lng: -116.4074 },
  { name: "שנגחאי, סין (UTC+8)", lat: 31.2304, lng: -121.4737 },
  { name: "הונג קונג (UTC+8)", lat: 22.3193, lng: -114.1694 },
  { name: "סינגפור (UTC+8)", lat: 1.3521, lng: -103.8198 },
  { name: "מומבאי, הודו (UTC+5:30)", lat: 19.076, lng: -72.8777 },
  { name: "דלהי, הודו (UTC+5:30)", lat: 28.7041, lng: -77.1025 },
  { name: "בנגקוק, תאילנד (UTC+7)", lat: 13.7563, lng: -100.5018 },
  { name: "מנילה, פיליפינים (UTC+8)", lat: 14.5995, lng: -120.9842 },
  { name: "ג'קרטה, אינדונזיה (UTC+7)", lat: -6.2088, lng: -106.8456 },
  { name: "סיאול, דרום קוריאה (UTC+9)", lat: 37.5665, lng: -126.978 },

  // Oceania
  { name: "מלבורן, אוסטרליה (UTC+11/+10)", lat: -37.8136, lng: -144.9631 },
  { name: "סידני, אוסטרליה (UTC+11/+10)", lat: -33.8688, lng: -151.2093 },
  { name: "ברסבן, אוסטרליה (UTC+10)", lat: -27.4698, lng: -153.0251 },
  { name: "פרת', אוסטרליה (UTC+8)", lat: -31.9505, lng: -115.8605 },
  { name: "אוקלנד, ניו זילנד (UTC+13/+12)", lat: -36.8485, lng: -174.7633 },

  // Africa & Middle East
  { name: "יוהנסבורג, דרום אפריקה (UTC+2)", lat: -26.2041, lng: -28.0473 },
  { name: "קייפטאון, דרום אפריקה (UTC+2)", lat: -33.9249, lng: -18.4241 },
  { name: "קהיר, מצרים (UTC+2)", lat: 30.0444, lng: -31.2357 },
  { name: "דובאי, איחוד האמירויות (UTC+4)", lat: 25.2048, lng: -55.2708 },
  { name: "איסטנבול, טורקיה (UTC+3)", lat: 41.0082, lng: -28.9784 },
  { name: "טהרן, איראן (UTC+3:30)", lat: 35.6892, lng: -51.389 },

  // More Europe
  { name: "מוסקבה, רוסיה (UTC+3)", lat: 55.7558, lng: -37.6176 },
  { name: "סנט פטרבורג, רוסיה (UTC+3)", lat: 59.9311, lng: -30.3609 },
  { name: "ורשה, פולין (UTC+1/+2)", lat: 52.2297, lng: -21.0122 },
  { name: "קופנהגן, דנמרק (UTC+1/+2)", lat: 55.6761, lng: -12.5683 },
  { name: "סטוקהולם, שוודיה (UTC+1/+2)", lat: 59.3293, lng: -18.0686 },
  { name: "הלסינקי, פינלנד (UTC+2/+3)", lat: 60.1699, lng: -24.9384 },
  { name: "אתונה, יוון (UTC+2/+3)", lat: 37.9838, lng: -23.7275 },
  { name: "ליסבון, פורטוגל (UTC+0/+1)", lat: 38.7223, lng: 9.1393 },
];

// Language options
const LANGUAGES = [
  { code: "he", name: "עברית", flag: "🇮🇱", dir: "rtl" },
  { code: "en", name: "English", flag: "🇺🇸", dir: "ltr" },
  { code: "es", name: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "ru", name: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "pt", name: "Português", flag: "🇧🇷", dir: "ltr" },
  { code: "it", name: "Italiano", flag: "🇮🇹", dir: "ltr" },
  { code: "zh", name: "中文", flag: "🇨🇳", dir: "ltr" },
  { code: "ja", name: "日本語", flag: "🇯🇵", dir: "ltr" },
  { code: "ko", name: "한국어", flag: "🇰🇷", dir: "ltr" },
];

// Translations
const TRANSLATIONS = {
  he: {
    title: "לוח זמני התפילה",
    subtitle: "זמנים מדויקים לכל מקום בעולם",
    selectDate: "בחר תאריך:",
    selectLocation: "בחר מיקום:",
    cityList: "בחר מרשימת ערים",
    mapSelection: "בחר מיקום במפה",
    manualCoords: "הזן קורדינאטות ידני",
    googleMaps: "חיפוש מתקדם (Google Maps)",
    calculate: "חשב זמני תפילה",
    coordinates: "קורדינאטות נוכחיות:",
    morningTimes: "זמני הבוקר",
    dayTimes: "זמני היום",
    eveningTimes: "זמני הערב",
    shabbatTimes: "זמני שבת",
    footer: "זמנים מחושבים על פי הלכה יהודית • מיוצר באהבה לעם ישראל",
    language: "שפה:",
    bsd: "בס״ד",
    searchPlaceholder: "הקלד שם עיר...",
    noResults: "לא נמצאו תוצאות",
    invalidCoordinates: "אנא הזן קורדינאטות תקינות",
    invalidLatitude: "קו הרוחב חייב להיות בין -90 ל-90",
    invalidLongitude: "קו האורך חייב להיות בין -180 ל-180",
  },
  en: {
    title: "Jewish Prayer Times",
    subtitle: "Accurate times for anywhere in the world",
    selectDate: "Select Date:",
    selectLocation: "Select Location:",
    cityList: "Choose from city list",
    mapSelection: "Select location on map",
    manualCoords: "Enter manual coordinates",
    googleMaps: "Advanced search (Google Maps)",
    calculate: "Calculate Prayer Times",
    coordinates: "Current coordinates:",
    morningTimes: "Morning Times",
    dayTimes: "Day Times",
    eveningTimes: "Evening Times",
    shabbatTimes: "Shabbat Times",
    footer:
      "Times calculated according to Jewish law • Made with love for the Jewish people",
    language: "Language:",
    bsd: 'B"H',
    searchPlaceholder: "Type city name...",
    noResults: "No results found",
    invalidCoordinates: "Please enter valid coordinates",
    invalidLatitude: "Latitude must be between -90 and 90",
    invalidLongitude: "Longitude must be between -180 and 180",
  },
  es: {
    title: "Horarios de Oración Judía",
    subtitle: "Horarios precisos para cualquier lugar del mundo",
    selectDate: "Seleccionar Fecha:",
    selectLocation: "Seleccionar Ubicación:",
    cityList: "Elegir de la lista de ciudades",
    googleMaps: "Búsqueda avanzada (Google Maps)",
    calculate: "Calcular Horarios de Oración",
    coordinates: "Coordenadas actuales:",
    morningTimes: "Horarios Matutinos",
    dayTimes: "Horarios del Día",
    eveningTimes: "Horarios Vespertinos",
    shabbatTimes: "Horarios de Shabat",
    footer:
      "Horarios calculados según la ley judía • Hecho con amor para el pueblo judío",
    language: "Idioma:",
    bsd: 'B"H',
    searchPlaceholder: "Escribe nombre de ciudad...",
    noResults: "No se encontraron resultados",
  },
  fr: {
    title: "Horaires de Prière Juive",
    subtitle: "Horaires précis pour n'importe où dans le monde",
    selectDate: "Sélectionner la Date:",
    selectLocation: "Sélectionner l'Emplacement:",
    cityList: "Choisir dans la liste des villes",
    googleMaps: "Recherche avancée (Google Maps)",
    calculate: "Calculer les Horaires de Prière",
    coordinates: "Coordonnées actuelles:",
    morningTimes: "Horaires du Matin",
    dayTimes: "Horaires du Jour",
    eveningTimes: "Horaires du Soir",
    shabbatTimes: "Horaires de Shabbat",
    footer:
      "Horaires calculés selon la loi juive • Fait avec amour pour le peuple juif",
    language: "Langue:",
    bsd: 'B"H',
    searchPlaceholder: "Tapez le nom de la ville...",
    noResults: "Aucun résultat trouvé",
  },
  ar: {
    title: "مواقيت الصلاة اليهودية",
    subtitle: "مواقيت دقيقة لأي مكان في العالم",
    selectDate: "اختر التاريخ:",
    selectLocation: "اختر الموقع:",
    cityList: "اختر من قائمة المدن",
    googleMaps: "البحث المتقدم (خرائط جوجل)",
    calculate: "احسب مواقيت الصلاة",
    coordinates: "الإحداثيات الحالية:",
    morningTimes: "مواقيت الصباح",
    dayTimes: "مواقيت النهار",
    eveningTimes: "مواقيت المساء",
    shabbatTimes: "مواقيت السبت",
    footer: "المواقيت محسوبة وفقاً للشريعة اليهودية • صُنع بحب للشعب اليهودي",
    language: "اللغة:",
    bsd: "بسم الله",
    searchPlaceholder: "اكتب اسم المدينة...",
    noResults: "لم يتم العثور على نتائج",
  },
};

const fmtZman = (iso) =>
  new Date(iso).toLocaleTimeString("he-IL", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

// Hebrew months with nikud (using the exact format from @hebcal/core)
const HEBREW_MONTHS = {
  1: "נִיסָן",
  2: "אִייָר",
  3: "סִיוָן",
  4: "תַּמּוּז",
  5: "אָב",
  6: "אֱלוּל",
  7: "תִּשְׁרֵי",
  8: "חֶשְׁוָן",
  9: "כִּסְלֵו",
  10: "טֵבֵת",
  11: "שְׁבָט",
  12: "אֲדָר",
  13: "אֲדָר א׳",
  14: "אֲדָר ב׳",
};

export default function Home() {
  const [alot90, setAlot90] = useState("");
  const [alot72, setAlot72] = useState("");
  const [talitTefillin, setTalitTefillin] = useState("");
  const [zricha, setZricha] = useState("");
  const [minchaGedola, setMinchaGedola] = useState("");
  const [minchaKetana, setMinchaKetana] = useState("");
  const [shkiya, setShkiya] = useState("");
  const [chatzot, setChatzot] = useState("");
  const [tzait, setTzait] = useState("");
  const [chatzotHaLayla, setChatzotHaLayla] = useState("");
  const [kenisatShabbat22, setkenisatShabbat22] = useState("");
  const [kenisatShabbat30, setkenisatShabbat30] = useState("");
  const [kenisatShabbat40, setkenisatShabbat40] = useState("");
  const [sofShemaMGA, setSofShemaMGA] = useState("");
  const [sofShemaGRA, setSofShemaGRA] = useState("");
  const [sofTefilaMGA, setSofTefilaMGA] = useState("");
  const [sofTefilaGRA, setSofTefilaGRA] = useState("");
  const [yetziatShabbat, setyetziatShabbat] = useState("");
  const [parasha, setparasha] = useState("");
  const [musafGRA, setmusafGRA] = useState("");
  const [start10GRA, setStart10GRA] = useState("");
  const [start10MGA, setStart10MGA] = useState("");
  const [fourthHourGRA, setFourthHourGRA] = useState("");
  const [fourthHourMGA, setFourthHourMGA] = useState("");
  const [fifthHourGRA, setFifthHourGRA] = useState("");
  const [fifthHourMGA, setFifthHourMGA] = useState("");
  const [plagMincha, setPlagMincha] = useState("");
  const [tzait90, setTzait90] = useState("");
  const [hebrewDate, setHebrewDate] = useState("");
  const [holiday, setHoliday] = useState("");
  const [dstText, setDstText] = useState("");

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  // Location states
  const [currentLat, setCurrentLat] = useState(DEFAULT_LAT);
  const [currentLng, setCurrentLng] = useState(DEFAULT_LNG);
  const [locationName, setLocationName] = useState("ירושלים, ישראל");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Manual coordinates input
  const [useManualCoords, setUseManualCoords] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualLocationName, setManualLocationName] = useState("");

  // Map selection
  const [showMap, setShowMap] = useState(false);

  // Language states
  const [currentLanguage, setCurrentLanguage] = useState("he");

  // Function to get current UTC offset for a city
  const getCurrentUTCForCity = (cityName) => {
    const month = new Date(date).getMonth() + 1; // 1-12
    const isDST = month >= 3 && month <= 10; // March to October (approximate DST period)

    if (cityName.includes("ישראל")) {
      return isDST ? "UTC+3" : "UTC+2";
    } else if (cityName.includes("ארצות הברית")) {
      if (
        cityName.includes("לוס אנג'לס") ||
        cityName.includes("סן פרנסיסקו") ||
        cityName.includes("לאס וגאס")
      ) {
        return isDST ? "UTC-7" : "UTC-8";
      } else if (cityName.includes("שיקגו")) {
        return isDST ? "UTC-5" : "UTC-6";
      } else if (cityName.includes("דנבר")) {
        return isDST ? "UTC-6" : "UTC-7";
      } else {
        return isDST ? "UTC-4" : "UTC-5"; // Eastern time
      }
    } else if (cityName.includes("אנגליה")) {
      return isDST ? "UTC+1" : "UTC+0";
    } else if (
      cityName.includes("צרפת") ||
      cityName.includes("גרמניה") ||
      cityName.includes("איטליה") ||
      cityName.includes("ספרד") ||
      cityName.includes("הולנד") ||
      cityName.includes("אוסטריה") ||
      cityName.includes("שוויץ") ||
      cityName.includes("הונגריה") ||
      cityName.includes("צ'כיה") ||
      cityName.includes("בלגיה")
    ) {
      return isDST ? "UTC+2" : "UTC+1";
    } else if (cityName.includes("קנדה")) {
      if (cityName.includes("ונקובר")) {
        return isDST ? "UTC-7" : "UTC-8";
      } else {
        return isDST ? "UTC-4" : "UTC-5";
      }
    } else if (cityName.includes("מקסיקו")) {
      return isDST ? "UTC-5" : "UTC-6";
    } else if (cityName.includes("ארגנטינה") || cityName.includes("ברזיל")) {
      return "UTC-3";
    } else if (cityName.includes("צ'ילה")) {
      return !isDST ? "UTC-3" : "UTC-4"; // Opposite season
    } else if (cityName.includes("פרו")) {
      return "UTC-5";
    } else if (cityName.includes("יפן") || cityName.includes("קוריאה")) {
      return "UTC+9";
    } else if (
      cityName.includes("סין") ||
      cityName.includes("הונג קונג") ||
      cityName.includes("סינגפור") ||
      cityName.includes("פיליפינים")
    ) {
      return "UTC+8";
    } else if (cityName.includes("הודו")) {
      return "UTC+5:30";
    } else if (cityName.includes("תאילנד") || cityName.includes("אינדונזיה")) {
      return "UTC+7";
    } else if (cityName.includes("אוסטרליה")) {
      if (cityName.includes("ברסבן") || cityName.includes("פרת'")) {
        return cityName.includes("ברסבן") ? "UTC+10" : "UTC+8";
      } else {
        return !isDST ? "UTC+11" : "UTC+10"; // Opposite season
      }
    } else if (cityName.includes("ניו זילנד")) {
      return !isDST ? "UTC+13" : "UTC+12"; // Opposite season
    } else if (cityName.includes("אפריקה") || cityName.includes("מצרים")) {
      return "UTC+2";
    } else if (cityName.includes("איחוד האמירויות")) {
      return "UTC+4";
    } else if (cityName.includes("טורקיה")) {
      return "UTC+3";
    } else if (cityName.includes("איראן")) {
      return "UTC+3:30";
    }

    return "UTC+0"; // Default
  };

  // Update cities with current UTC offset
  const getUpdatedCities = () => {
    return PREDEFINED_CITIES.map((city) => {
      const baseName = city.name.replace(/\s*\(UTC[^)]*\)/, ""); // Remove existing UTC info
      const currentUTC = getCurrentUTCForCity(baseName);
      return {
        ...city,
        name: `${baseName} (${currentUTC})`,
      };
    });
  };
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isGoogleTranslateLoaded, setIsGoogleTranslateLoaded] = useState(false);

  // Google Places autocomplete
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);

  const currentLangData = LANGUAGES.find(
    (lang) => lang.code === currentLanguage
  );
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.he;

  // Filter cities based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      const updatedCities = getUpdatedCities();
      const filtered = updatedCities.filter(
        (city) =>
          city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.name.includes(searchTerm)
      );
      setFilteredCities(filtered);
      setShowSearchResults(true);
    } else {
      setFilteredCities([]);
      setShowSearchResults(false);
    }
  }, [searchTerm, date]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Load Google Translate
    if (!window.google || !window.google.translate) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.head.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "he",
            includedLanguages: "he,en,es,fr,de,ru,ar,pt,it,zh,ja,ko",
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
        setIsGoogleTranslateLoaded(true);
      };
    }
  }, []);

  useEffect(() => {
    // Update document direction and language
    document.documentElement.dir = currentLangData?.dir || "rtl";
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, currentLangData]);

  // Commented out Google Maps for now - uncomment when you have an API key
  // useEffect(() => {
  //   if (!window.google?.maps) {
  //     const script = document.createElement('script');
  //     // Replace YOUR_GOOGLE_MAPS_API_KEY with your actual API key
  //     script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&language=${currentLanguage}`;
  //     script.async = true;
  //     script.defer = true;
  //     script.onload = initGoogleMaps;
  //     document.head.appendChild(script);
  //   } else {
  //     initGoogleMaps();
  //   }
  // }, [currentLanguage]);

  const initGoogleMaps = () => {
    if (window.google?.maps && searchInputRef.current) {
      // Find the input element inside the search container
      const inputElement = searchInputRef.current.querySelector("input");
      if (!inputElement) return;

      // Initialize Google Places Autocomplete
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputElement,
        {
          types: ["(cities)"],
          language: currentLanguage,
          fields: ["formatted_address", "geometry", "place_id"],
        }
      );

      // Handle place selection
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address;

          setCurrentLat(lat);
          setCurrentLng(lng);
          setLocationName(address);
          setSearchTerm("");
          setShowSearchResults(false);

          console.log(`📍 Selected: ${address} (${lat}, ${lng})`);
        }
      });

      // Store autocomplete instance
      autocompleteRef.current = autocomplete;
    }
  };

  const handleCitySelect = (city) => {
    setCurrentLat(city.lat);
    setCurrentLng(city.lng);
    setLocationName(city.name);
    setShowCityDropdown(false);
  };

  const handleSearchSelect = (city) => {
    setCurrentLat(city.lat);
    setCurrentLng(city.lng);
    setLocationName(city.name);
    setSearchTerm("");
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowSearchResults(false);
  };

  const handleManualCoordsSubmit = () => {
    const lat = parseFloat(manualLat);
    let lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      alert(t.invalidCoordinates || "Please enter valid coordinates");
      return;
    }

    if (lat < -90 || lat > 90) {
      alert(t.invalidLatitude || "Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      alert(t.invalidLongitude || "Longitude must be between -180 and 180");
      return;
    }

    // For calculations, we need to reverse the longitude
    const calculationLng = -lng;

    setCurrentLat(lat);
    setCurrentLng(calculationLng); // Store the reversed longitude for calculations
    setLocationName(
      manualLocationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    ); // Display original longitude
    setUseManualCoords(false);
  };

  const clearManualCoords = () => {
    setManualLat("");
    setManualLng("");
    setManualLocationName("");
  };

  const handleMapLocationSelect = (coords) => {
    const { latitude, longitude } = coords;
    // For calculations, we need to reverse the longitude
    const calculationLng = -longitude;

    setCurrentLat(latitude);
    setCurrentLng(calculationLng); // Store the reversed longitude for calculations
    setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`); // Display original longitude
    console.log(
      `📍 Map selected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    );
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    setShowLanguageDropdown(false);

    // For languages not in our translations, use Google Translate
    if (
      !TRANSLATIONS[langCode] &&
      window.google?.translate &&
      isGoogleTranslateLoaded
    ) {
      // Trigger Google Translate
      const selectElement = document.querySelector(".goog-te-combo");
      if (selectElement) {
        selectElement.value = langCode;
        selectElement.dispatchEvent(new Event("change"));
      }
    }
  };

  const getZmanim = async (retryCount = 0) => {
    try {
      const dateString = date;

      console.log("🌐 Making API request:", {
        url: "/api/zmanim",
        latitude: currentLat,
        longitude: currentLng,
        date: dateString,
      });

      const resp = await fetch("/api/zmanim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          latitude: currentLat,
          longitude: currentLng,
          date: dateString,
        }),
      });

      console.log("📡 Response status:", resp.status, resp.statusText);

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error("❌ API Error:", errorText);
        throw new Error(`Server error: ${resp.status} - ${errorText}`);
      }

      const data = await resp.json();
      console.log("✅ API response received:", data);

      // Force UTC when formatting so no extra TZ shift
      setAlot90(fmtZman(data.alot90));
      setAlot72(fmtZman(data.alot72));
      setTalitTefillin(fmtZman(data.talitTefillin));
      setZricha(fmtZman(data.zricha));
      setmusafGRA(fmtZman(data.musafGRA));
      setStart10GRA(fmtZman(data.startOfTenthHourGRA));
      setStart10MGA(fmtZman(data.startOfTenthHourMGA));
      setFourthHourGRA(fmtZman(data.fourthHourGRA));
      setFourthHourMGA(fmtZman(data.fourthHourMGA));
      setFifthHourGRA(fmtZman(data.fifthHourGRA));
      setFifthHourMGA(fmtZman(data.fifthHourMGA));
      setMinchaGedola(fmtZman(data.minchaGedola));
      setMinchaKetana(fmtZman(data.minchaKetana));
      setShkiya(fmtZman(data.shkiya));
      setChatzot(fmtZman(data.chatzot));
      setPlagMincha(fmtZman(data.plagMincha));
      setTzait(fmtZman(data.tzait));
      setTzait90(fmtZman(data.tzait90));
      setChatzotHaLayla(fmtZman(data.chatzotHaLayla));
      setkenisatShabbat22(fmtZman(data.kenisatShabbat22));
      setkenisatShabbat30(fmtZman(data.kenisatShabbat30));
      setkenisatShabbat40(fmtZman(data.kenisatShabbat40));
      setSofShemaMGA(fmtZman(data.sofZmanShemaMGA));
      setSofShemaGRA(fmtZman(data.sofZmanShemaGRA));
      setSofTefilaMGA(fmtZman(data.sofZmanTefilaMGA));
      setSofTefilaGRA(fmtZman(data.sofZmanTefilaGRA));
      setyetziatShabbat(fmtZman(data.yetziatShabbat));
      setparasha(data.parasha);

      setError("");
    } catch (e) {
      console.error("❌ getZmanim error:", e);

      // Provide more specific error messages for different types of errors
      let errorMessage = e.message;

      if (e.name === "TypeError" && e.message.includes("fetch")) {
        errorMessage =
          currentLanguage === "he"
            ? "שגיאת רשת - בדוק את החיבור לאינטרנט"
            : "Network error - check your internet connection";
      } else if (e.message.includes("Failed to fetch")) {
        errorMessage =
          currentLanguage === "he"
            ? "לא ניתן להתחבר לשרת - נסה שוב מאוחר יותר"
            : "Cannot connect to server - try again later";
      } else if (e.message.includes("Server error")) {
        errorMessage =
          currentLanguage === "he"
            ? "שגיאת שרת - נסה שוב"
            : "Server error - please try again";
      }

      setError(errorMessage);

      // Retry once for network errors on mobile devices
      if (
        retryCount === 0 &&
        (e.message.includes("fetch") || e.message.includes("Failed to fetch"))
      ) {
        console.log("🔄 Retrying request...");
        setTimeout(() => {
          getZmanim(1);
        }, 1000);
      }
    }
  };

  // Update Hebrew date conversion function
  const updateHebrewDate = (gregorianDate) => {
    if (!gregorianDate) return;

    try {
      const result = getHebrewDate(gregorianDate);
      if (!result) return;

      const { date, holidays } = result;
      setHebrewDate(date);

      // Set holiday text
      let holidayText = "";

      // First check if it's Shabbat
      const dayOfWeek = new Date(gregorianDate).getDay();
      if (dayOfWeek === 6) {
        if (parasha) {
          holidayText = `שבת פרשת ${parasha}`;
        } else {
          holidayText = "שבת";
        }
      }

      // Add other holidays if they exist
      if (holidays && holidays.length > 0) {
        if (holidayText) {
          holidayText += ` • ${holidays[0]}`;
        } else {
          holidayText = holidays[0];
        }
      }

      setHoliday(holidayText);

      // Update DST status
      const isDst = isIsraelDST(new Date(gregorianDate));
      setDstText(isDst ? "שעון קיץ" : "שעון חורף");
    } catch (error) {
      console.error("Error updating Hebrew date:", error);
    }
  };

  // Update Hebrew date when Gregorian date changes
  useEffect(() => {
    if (date) {
      updateHebrewDate(date);
    }
  }, [date]); // Only depend on date changes

  // Update zmanim and parasha when date changes
  useEffect(() => {
    if (date && currentLat && currentLng) {
      getZmanim();
    }
  }, [date, currentLat, currentLng]); // Depend on date, latitude, and longitude changes

  // Update holiday text (including parasha) when parasha changes
  useEffect(() => {
    if (date) {
      const dayOfWeek = new Date(date).getDay();
      let holidayText = "";

      // Always show the current parasha
      if (parasha) {
        if (dayOfWeek === 6) {
          holidayText = `שבת פרשת ${parasha}`;
        } else {
          holidayText = `פרשת ${parasha}`;
        }
      } else if (dayOfWeek === 6) {
        holidayText = "שבת";
      }

      // Add other holidays if they exist
      const result = getHebrewDate(date);
      if (result && result.holidays && result.holidays.length > 0) {
        if (holidayText) {
          holidayText += ` • ${result.holidays[0]}`;
        } else {
          holidayText = result.holidays[0];
        }
      }

      setHoliday(holidayText);
    }
  }, [date, parasha]); // Depend on date and parasha changes

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          * {
            box-sizing: border-box;
          }

          html {
            direction: ${currentLangData?.dir || "rtl"};
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          }

          body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
          }

          .goog-te-banner-frame {
            display: none !important;
          }

          .goog-te-menu-value {
            padding: 3px 5px;
            font-size: 12px;
          }

          #google_translate_element {
            display: none;
          }

          /* Force light mode for all form elements */
          input[type="date"],
          input[type="text"],
          input[type="number"] {
            color-scheme: light !important;
            background-color: white !important;
            color: #333 !important;
          }

          /* Ensure dropdown scrollbar is visible */
          .language-dropdown::-webkit-scrollbar {
            width: 8px;
          }

          .language-dropdown::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .language-dropdown::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }

          .language-dropdown::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
          }

          @media (max-width: 768px) {
            .main-container {
              margin: 40px auto 0 !important;
              border-radius: 10px !important;
            }

            .header-padding {
              padding: 15px !important;
            }

            .content-padding {
              padding: 15px !important;
            }

            .card-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
              padding: 0 !important;
            }

            .input-responsive {
              width: 100% !important;
              max-width: none !important;
            }
          }

          @media (max-width: 480px) {
            .outer-padding {
              padding: 5px !important;
            }

            .main-container {
              margin: 30px auto 0 !important;
            }
          }
        `}</style>
      </Head>

      <div
        className="outer-padding"
        style={{
          minHeight: "100vh",
          padding: "10px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        {/* בס"ד / B"H in top right corner */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: currentLangData?.dir === "rtl" ? "10px" : "auto",
            left: currentLangData?.dir === "ltr" ? "10px" : "auto",
            fontSize: "16px",
            fontWeight: "bold",
            color: "white",
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          {t.bsd}
        </div>

        {/* Language Selector */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: currentLangData?.dir === "rtl" ? "10px" : "auto",
            right: currentLangData?.dir === "ltr" ? "10px" : "auto",
            zIndex: 1001,
          }}
        >
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              style={{
                padding: "6px 10px",
                fontSize: "13px",
                border: "2px solid white",
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.95)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#2c3e50",
                fontWeight: "500",
              }}
            >
              {currentLangData?.dir === "rtl" ? (
                <>
                  <span>▼</span>
                  <span>{currentLangData?.name}</span>
                  <span>{currentLangData?.flag}</span>
                </>
              ) : (
                <>
                  <span>{currentLangData?.flag}</span>
                  <span>{currentLangData?.name}</span>
                  <span>▼</span>
                </>
              )}
            </button>

            {showLanguageDropdown && (
              <div
                className="language-dropdown"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: currentLangData?.dir === "rtl" ? "auto" : "0",
                  right: currentLangData?.dir === "rtl" ? "0" : "auto",
                  backgroundColor: "white",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  maxHeight: "250px",
                  overflowY: "auto",
                  zIndex: 1002,
                  boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                  minWidth: "180px",
                  width: "200px",
                }}
              >
                {LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    style={{
                      padding: "8px 10px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor:
                        currentLanguage === lang.code ? "#f0f8ff" : "white",
                      fontSize: "13px",
                      color: "#2c3e50",
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor =
                        currentLanguage === lang.code ? "#f0f8ff" : "white")
                    }
                  >
                    {currentLangData?.dir === "rtl" ? (
                      <>
                        <span>{lang.name}</span>
                        <span>{lang.flag}</span>
                      </>
                    ) : (
                      <>
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </>
                    )}
                  </div>
                ))}

                {/* Scroll indicator */}
                <div
                  style={{
                    padding: "8px 10px",
                    backgroundColor: "#f8f9fa",
                    borderTop: "1px solid #eee",
                    fontSize: "11px",
                    color: "#666",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  {currentLanguage === "he"
                    ? "גלול לעוד שפות ↕"
                    : "Scroll for more languages ↕"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Google Translate Element */}
        <div id="google_translate_element" style={{ display: "none" }}></div>

        {/* Reset Translation Button */}
        {currentLanguage !== "he" && !TRANSLATIONS[currentLanguage] && (
          <div
            style={{
              position: "fixed",
              bottom: "15px",
              right: "15px",
              zIndex: 1001,
            }}
          >
            <button
              onClick={() => {
                setCurrentLanguage("he");
                window.location.reload();
              }}
              style={{
                padding: "8px 12px",
                fontSize: "13px",
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              {currentLangData?.dir === "rtl" ? (
                <>
                  {currentLanguage === "he" ? "חזור לעברית" : "Back to Hebrew"}
                  <span style={{ marginLeft: "4px" }}>🔄</span>
                </>
              ) : (
                <>
                  <span style={{ marginRight: "4px" }}>🔄</span>
                  {currentLanguage === "he" ? "חזור לעברית" : "Back to Hebrew"}
                </>
              )}
            </button>
          </div>
        )}

        <div
          className="main-container"
          style={{
            maxWidth: "1200px",
            margin: "50px auto 0",
            backgroundColor: "white",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="header-padding"
            style={{
              background: "linear-gradient(45deg, #2c3e50, #3498db)",
              color: "white",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                margin: "0",
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                fontWeight: "300",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {currentLangData?.dir === "rtl" ? (
                <>
                  <img
                    src="/logo.png"
                    alt="Logo"
                    style={{
                      width: "40px",
                      height: "40px",
                      marginLeft: "10px",
                    }}
                  />
                  {t.title}
                  <span>🕐</span>
                </>
              ) : (
                <>
                  <img
                    src="/logo.png"
                    alt="Logo"
                    style={{
                      width: "40px",
                      height: "40px",
                      marginRight: "10px",
                    }}
                  />
                  {t.title}
                  <span>🕐</span>
                </>
              )}
            </h1>
            <p
              style={{
                margin: "10px 0 0 0",
                fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                opacity: "0.9",
              }}
            >
              {t.subtitle}
            </p>
            <p
              style={{
                margin: "5px 0 0 0",
                fontSize: "14px",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {/* ©נוצר על ידי תחום ניהו"ג - חיים פיציק קוה */}
              ©נוצר על ידי תחום ניהו"ג
            </p>
          </div>

          {/* Main Content */}
          <div className="content-padding" style={{ padding: "20px" }}>
            {/* Date Selection */}
            <div
              style={{
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                border: "2px solid #e9ecef",
              }}
            >
              <label
                htmlFor="date"
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "#2c3e50",
                }}
              >
                {currentLangData?.dir === "rtl" ? (
                  <>{t.selectDate} 📅</>
                ) : (
                  <>📅 {t.selectDate}</>
                )}
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    updateHebrewDate(e.target.value);
                  }}
                  style={{
                    padding: "12px 15px",
                    fontSize: "16px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    width: "200px",
                    direction: "ltr",
                    colorScheme: "light",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 15px",
                      fontSize: "16px",
                      backgroundColor: "#e3f2fd",
                      border: "2px solid #1565c0",
                      borderRadius: "8px",
                      color: "#1565c0",
                      fontWeight: "500",
                      direction: "rtl",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      flex: "1",
                      minWidth: "fit-content",
                      placeSelf: "anchor-center",
                    }}
                  >
                    {hebrewDate.split("•")[0].trim()}
                  </div>
                  {holiday && (
                    <div
                      style={{
                        padding: "12px 15px",
                        fontSize: "16px",
                        backgroundColor: "#fdf6e8",
                        border: "2px solid #f39c12",
                        borderRadius: "8px",
                        color: "#d35400",
                        fontWeight: "500",
                        direction: "rtl",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        flex: "1",
                        minWidth: "fit-content",
                        placeSelf: "anchor-center",
                      }}
                    >
                      {holiday}
                    </div>
                  )}
                  <div
                    style={{
                      padding: "12px 15px",
                      fontSize: "16px",
                      backgroundColor: "#f3e5f5",
                      border: "2px solid #7b1fa2",
                      borderRadius: "8px",
                      color: "#7b1fa2",
                      fontWeight: "500",
                      direction: "rtl",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      flex: "1",
                      minWidth: "fit-content",
                      placeSelf: "anchor-center",
                    }}
                  >
                    {dstText}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Selection */}
            <div
              style={{
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                border: "2px solid #e9ecef",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "15px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "#2c3e50",
                }}
              >
                {currentLangData?.dir === "rtl" ? (
                  <>{t.selectLocation} 📍</>
                ) : (
                  <>📍 {t.selectLocation}</>
                )}
              </label>

              <div style={{ marginBottom: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      backgroundColor:
                        !useManualCoords && !showMap ? "#e8f4fd" : "#f8f9fa",
                      border: `2px solid ${
                        !useManualCoords && !showMap ? "#3498db" : "#ddd"
                      }`,
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      color: "#2c3e50",
                      fontWeight: "500",
                    }}
                  >
                    <input
                      type="radio"
                      name="locationMethod"
                      checked={!useManualCoords && !showMap}
                      onChange={() => {
                        setUseManualCoords(false);
                        setShowMap(false);
                      }}
                      style={{
                        margin:
                          currentLangData?.dir === "rtl"
                            ? "0 0 0 8px"
                            : "0 8px 0 0",
                      }}
                    />
                    {currentLangData?.dir === "rtl" ? (
                      <>{t.cityList} 🏙️</>
                    ) : (
                      <>🏙️ {t.cityList}</>
                    )}
                  </label>

                  <label
                    style={{
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      backgroundColor: showMap ? "#e8f4fd" : "#f8f9fa",
                      border: `2px solid ${showMap ? "#3498db" : "#ddd"}`,
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      color: "#2c3e50",
                      fontWeight: "500",
                    }}
                  >
                    <input
                      type="radio"
                      name="locationMethod"
                      checked={showMap}
                      onChange={() => {
                        setShowMap(true);
                        setUseManualCoords(false);
                      }}
                      style={{
                        margin:
                          currentLangData?.dir === "rtl"
                            ? "0 0 0 8px"
                            : "0 8px 0 0",
                      }}
                    />
                    {currentLangData?.dir === "rtl" ? (
                      <>{t.mapSelection} 🗺️</>
                    ) : (
                      <>🗺️ {t.mapSelection}</>
                    )}
                  </label>

                  <label
                    style={{
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      backgroundColor: useManualCoords ? "#e8f4fd" : "#f8f9fa",
                      border: `2px solid ${
                        useManualCoords ? "#3498db" : "#ddd"
                      }`,
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      color: "#2c3e50",
                      fontWeight: "500",
                    }}
                  >
                    <input
                      type="radio"
                      name="locationMethod"
                      checked={useManualCoords}
                      onChange={() => {
                        setUseManualCoords(true);
                        setShowMap(false);
                      }}
                      style={{
                        margin:
                          currentLangData?.dir === "rtl"
                            ? "0 0 0 8px"
                            : "0 8px 0 0",
                      }}
                    />
                    {currentLangData?.dir === "rtl" ? (
                      <>{t.manualCoords} 📍</>
                    ) : (
                      <>📍 {t.manualCoords}</>
                    )}
                  </label>
                </div>

                {!useManualCoords && !showMap && (
                  <div
                    style={{
                      padding: "10px",
                      backgroundColor: "#e8f4fd",
                      borderRadius: "8px",
                      border: "1px solid #3498db",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        color: "#2980b9",
                      }}
                    >
                      {currentLangData?.dir === "rtl" ? (
                        <>
                          <span>
                            {currentLanguage === "he"
                              ? `חיפוש מעל ${
                                  getUpdatedCities().length
                                } ערים פופולריות מכל העולם`
                              : `Search over ${
                                  getUpdatedCities().length
                                } popular cities worldwide`}
                          </span>
                          <span>🏙️</span>
                        </>
                      ) : (
                        <>
                          <span>🏙️</span>
                          <span>
                            {currentLanguage === "he"
                              ? `חיפוש מעל ${
                                  getUpdatedCities().length
                                } ערים פופולריות מכל העולם`
                              : `Search over ${
                                  getUpdatedCities().length
                                } popular cities worldwide`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {showMap && (
                  <div
                    style={{
                      padding: "15px",
                      backgroundColor: "#f0f8ff",
                      borderRadius: "8px",
                      border: "1px solid #3498db",
                      marginBottom: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        color: "#2980b9",
                        marginBottom: "15px",
                      }}
                    >
                      {currentLangData?.dir === "rtl" ? (
                        <>
                          <span>
                            {currentLanguage === "he"
                              ? "בחר מיקום מדויק על המפה - עובד גם באופליין"
                              : "Select precise location on map - works offline too"}
                          </span>
                          <span>🗺️</span>
                        </>
                      ) : (
                        <>
                          <span>🗺️</span>
                          <span>
                            {currentLanguage === "he"
                              ? "בחר מיקום מדויק על המפה - עובד גם באופליין"
                              : "Select precise location on map - works offline too"}
                          </span>
                        </>
                      )}
                    </div>
                    <Map
                      onLocationSelect={handleMapLocationSelect}
                      initialLat={Math.abs(currentLat)}
                      initialLng={Math.abs(currentLng)}
                    />
                  </div>
                )}

                {useManualCoords && (
                  <div
                    style={{
                      padding: "15px",
                      backgroundColor: "#f0f8ff",
                      borderRadius: "8px",
                      border: "1px solid #3498db",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        color: "#2980b9",
                        marginBottom: "10px",
                      }}
                    >
                      {currentLangData?.dir === "rtl" ? (
                        <>
                          <span>
                            {currentLanguage === "he"
                              ? "הזן קורדינאטות מדויקות של כל מקום בעולם"
                              : "Enter precise coordinates for any location worldwide"}
                          </span>
                          <span>📍</span>
                        </>
                      ) : (
                        <>
                          <span>📍</span>
                          <span>
                            {currentLanguage === "he"
                              ? "הזן קורדינאטות מדויקות של כל מקום בעולם"
                              : "Enter precise coordinates for any location worldwide"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {!useManualCoords && !showMap ? (
                <div style={{ position: "relative" }} ref={searchInputRef}>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => {
                        if (searchTerm.length > 0) {
                          setShowSearchResults(true);
                        }
                      }}
                      placeholder={
                        currentLanguage === "he"
                          ? "הקלד שם עיר מכל העולם..."
                          : "Type any city name worldwide..."
                      }
                      className="input-responsive"
                      style={{
                        padding:
                          currentLangData?.dir === "rtl"
                            ? "12px 40px 12px 15px"
                            : "12px 15px 12px 40px",
                        fontSize: "16px",
                        width: "100%",
                        maxWidth: "350px",
                        border: "2px solid #ddd",
                        borderRadius: "8px",
                        textAlign:
                          currentLangData?.dir === "rtl" ? "right" : "left",
                        outline: "none",
                        borderColor: showSearchResults ? "#3498db" : "#ddd",
                        boxSizing: "border-box",
                        colorScheme: "light",
                      }}
                    />

                    {/* Search icon */}
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        [currentLangData?.dir === "rtl" ? "right" : "left"]:
                          "12px",
                        transform: "translateY(-50%)",
                        color: "#666",
                        fontSize: "16px",
                        pointerEvents: "none",
                      }}
                    >
                      🔍
                    </span>

                    {/* Clear button */}
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        style={{
                          position: "absolute",
                          top: "50%",
                          [currentLangData?.dir === "rtl" ? "left" : "right"]:
                            "8px",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          fontSize: "18px",
                          cursor: "pointer",
                          color: "#999",
                          padding: "4px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f0f0f0")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "transparent")
                        }
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Current selection display */}
                  {!showSearchResults && locationName && searchTerm === "" && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "8px 12px",
                        backgroundColor: "#e8f4fd",
                        border: "1px solid #3498db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: "#2980b9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {currentLangData?.dir === "rtl" ? (
                          <>
                            {currentLanguage === "he" ? "נבחר:" : "Selected:"}{" "}
                            {locationName} ✓
                          </>
                        ) : (
                          <>
                            ✓ {currentLanguage === "he" ? "נבחר:" : "Selected:"}{" "}
                            {locationName}
                          </>
                        )}
                      </span>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilteredCities(getUpdatedCities());
                          setShowSearchResults(true);
                        }}
                        style={{
                          background: "none",
                          border: "1px solid #3498db",
                          color: "#3498db",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#3498db";
                          e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "#3498db";
                        }}
                      >
                        {currentLanguage === "he" ? "שנה" : "Change"}
                      </button>
                    </div>
                  )}

                  {/* Show popular cities button */}
                  {!showSearchResults && searchTerm === "" && (
                    <div style={{ marginTop: "8px" }}>
                      <button
                        onClick={() => {
                          setFilteredCities(getUpdatedCities());
                          setShowSearchResults(true);
                        }}
                        style={{
                          padding: "8px 16px",
                          fontSize: "14px",
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          cursor: "pointer",
                          color: "#2c3e50",
                          fontWeight: "500",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#e9ecef")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#f8f9fa")
                        }
                      >
                        {currentLangData?.dir === "rtl" ? (
                          <>
                            {currentLanguage === "he"
                              ? "ערים פופולריות"
                              : "Popular cities"}{" "}
                            ({getUpdatedCities().length}) 📋
                          </>
                        ) : (
                          <>
                            📋{" "}
                            {currentLanguage === "he"
                              ? "ערים פופולריות"
                              : "Popular cities"}{" "}
                            ({getUpdatedCities().length})
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Search results dropdown */}
                  {showSearchResults && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: "white",
                        border: "2px solid #3498db",
                        borderRadius: "8px",
                        maxHeight: "300px",
                        overflowY: "auto",
                        zIndex: 1000,
                        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                        marginTop: "2px",
                      }}
                    >
                      {filteredCities.length > 0 ? (
                        <>
                          <div
                            style={{
                              padding: "8px 15px",
                              backgroundColor: "#f8f9fa",
                              borderBottom: "1px solid #eee",
                              fontSize: "12px",
                              color: "#2c3e50",
                              fontWeight: "600",
                            }}
                          >
                            {filteredCities.length}{" "}
                            {currentLanguage === "he"
                              ? "תוצאות נמצאו"
                              : "results found"}
                          </div>
                          {filteredCities.slice(0, 10).map((city, index) => (
                            <div
                              key={index}
                              onClick={() => handleSearchSelect(city)}
                              style={{
                                padding: "12px 15px",
                                cursor: "pointer",
                                borderBottom:
                                  index <
                                  Math.min(filteredCities.length, 10) - 1
                                    ? "1px solid #eee"
                                    : "none",
                                transition: "background-color 0.2s",
                                textAlign:
                                  currentLangData?.dir === "rtl"
                                    ? "right"
                                    : "left",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                color: "#2c3e50",
                                fontSize: "14px",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#f0f8ff")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "white")
                              }
                            >
                              {currentLangData?.dir === "rtl" ? (
                                <>
                                  <span style={{ fontSize: "16px" }}>📍</span>
                                  <span>{city.name}</span>
                                </>
                              ) : (
                                <>
                                  <span>{city.name}</span>
                                  <span style={{ fontSize: "16px" }}>📍</span>
                                </>
                              )}
                            </div>
                          ))}
                          {filteredCities.length > 10 && (
                            <div
                              style={{
                                padding: "8px 15px",
                                backgroundColor: "#f8f9fa",
                                fontSize: "12px",
                                color: "#2c3e50",
                                textAlign: "center",
                              }}
                            >
                              {currentLanguage === "he"
                                ? `+${
                                    filteredCities.length - 10
                                  } תוצאות נוספות...`
                                : `+${
                                    filteredCities.length - 10
                                  } more results...`}
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          style={{
                            padding: "20px 15px",
                            textAlign: "center",
                            color: "#2c3e50",
                            fontSize: "14px",
                          }}
                        >
                          {currentLangData?.dir === "rtl" ? (
                            <>😔 {t.noResults}</>
                          ) : (
                            <>{t.noResults} 😔</>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                useManualCoords && (
                  <div
                    style={{
                      padding: "20px",
                      backgroundColor: "#f0f8ff",
                      borderRadius: "10px",
                      border: "2px solid #3498db",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "15px",
                        marginBottom: "15px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "5px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#2980b9",
                          }}
                        >
                          {currentLanguage === "he"
                            ? "קו רוחב (Latitude):"
                            : "Latitude:"}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="-90"
                          max="90"
                          value={manualLat}
                          onChange={(e) => setManualLat(e.target.value)}
                          placeholder={
                            currentLanguage === "he"
                              ? "לדוגמה: 31.7683"
                              : "e.g. 31.7683"
                          }
                          style={{
                            width: "100%",
                            padding: "10px",
                            fontSize: "14px",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            textAlign:
                              currentLangData?.dir === "rtl" ? "right" : "left",
                            colorScheme: "light",
                          }}
                        />
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#2c3e50",
                            marginTop: "3px",
                          }}
                        >
                          {currentLanguage === "he"
                            ? "בין -90 ל-90"
                            : "Between -90 and 90"}
                        </div>
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "5px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#2980b9",
                          }}
                        >
                          {currentLanguage === "he"
                            ? "קו אורך (Longitude):"
                            : "Longitude:"}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="-180"
                          max="180"
                          value={manualLng}
                          onChange={(e) => {
                            const value = e.target.value;
                            setManualLng(value);
                          }}
                          placeholder={
                            currentLanguage === "he"
                              ? "לדוגמה: 35.2137"
                              : "e.g. 35.2137"
                          }
                          style={{
                            width: "100%",
                            padding: "10px",
                            fontSize: "14px",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            textAlign:
                              currentLangData?.dir === "rtl" ? "right" : "left",
                            colorScheme: "light",
                          }}
                        />
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#2c3e50",
                            marginTop: "3px",
                          }}
                        >
                          {currentLanguage === "he"
                            ? "בין -180 ל-180 • מזרח: חיובי (35.2137), מערב: שלילי (-74.0060)"
                            : "Between -180 and 180 • East: positive (35.2137), West: negative (-74.0060)"}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#2980b9",
                        }}
                      >
                        {currentLanguage === "he"
                          ? "שם המיקום (אופציונלי):"
                          : "Location Name (Optional):"}
                      </label>
                      <input
                        type="text"
                        value={manualLocationName}
                        onChange={(e) => setManualLocationName(e.target.value)}
                        placeholder={
                          currentLanguage === "he"
                            ? "לדוגמה: הבית שלי"
                            : "e.g. My Home"
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          fontSize: "14px",
                          border: "1px solid #ddd",
                          borderRadius: "5px",
                          textAlign:
                            currentLangData?.dir === "rtl" ? "right" : "left",
                          colorScheme: "light",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={handleManualCoordsSubmit}
                        disabled={!manualLat || !manualLng}
                        style={{
                          padding: "10px 20px",
                          fontSize: "14px",
                          fontWeight: "600",
                          backgroundColor:
                            !manualLat || !manualLng ? "#ccc" : "#27ae60",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor:
                            !manualLat || !manualLng
                              ? "not-allowed"
                              : "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (manualLat && manualLng) {
                            e.target.style.backgroundColor = "#2ecc71";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (manualLat && manualLng) {
                            e.target.style.backgroundColor = "#27ae60";
                          }
                        }}
                      >
                        {currentLangData?.dir === "rtl" ? (
                          <>
                            {currentLanguage === "he" ? "אישור" : "Confirm"} ✓
                          </>
                        ) : (
                          <>
                            ✓ {currentLanguage === "he" ? "אישור" : "Confirm"}
                          </>
                        )}
                      </button>

                      <button
                        onClick={clearManualCoords}
                        style={{
                          padding: "10px 20px",
                          fontSize: "14px",
                          fontWeight: "600",
                          backgroundColor: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#c0392b")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#e74c3c")
                        }
                      >
                        {currentLangData?.dir === "rtl" ? (
                          <>{currentLanguage === "he" ? "נקה" : "Clear"} 🗑️</>
                        ) : (
                          <>🗑️ {currentLanguage === "he" ? "נקה" : "Clear"}</>
                        )}
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: "15px",
                        padding: "10px",
                        backgroundColor: "#fff3cd",
                        borderRadius: "5px",
                        border: "1px solid #ffeaa7",
                        fontSize: "12px",
                        color: "#856404",
                      }}
                    >
                      {currentLangData?.dir === "rtl" ? (
                        <>
                          {currentLanguage === "he"
                            ? "טיפ: אתה יכול למצוא קורדינאטות במפות Google על ידי לחיצה ימנית על המיקום ובחירת הקורדינאטות. השתמש בקורדינאטות בדיוק כפי שהן מופיעות."
                            : "Tip: You can find coordinates in Google Maps by right-clicking on a location and selecting the coordinates. Use coordinates exactly as they appear."}{" "}
                          💡
                        </>
                      ) : (
                        <>
                          💡{" "}
                          {currentLanguage === "he"
                            ? "טיפ: אתה יכול למצוא קורדינאטות במפות Google על ידי לחיצה ימנית על המיקום ובחירת הקורדינאטות. השתמש בקורדינאטות בדיוק כפי שהן מופיעות."
                            : "Tip: You can find coordinates in Google Maps by right-clicking on a location and selecting the coordinates. Use coordinates exactly as they appear."}
                        </>
                      )}
                    </div>
                  </div>
                )
              )}

              <div
                style={{
                  fontSize: "12px",
                  color: "#333",
                  marginTop: "10px",
                  padding: "8px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "5px",
                  textAlign: currentLangData?.dir === "rtl" ? "right" : "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {currentLangData?.dir === "rtl" ? (
                  <>
                    <span>🌍</span>
                    {t.coordinates} {currentLat.toFixed(4)},{" "}
                    {currentLng.toFixed(4)}
                  </>
                ) : (
                  <>
                    {t.coordinates} {currentLat.toFixed(4)},{" "}
                    {currentLng.toFixed(4)}
                    <span>🌍</span>
                  </>
                )}
              </div>
            </div>

            {/* Calculate Button כפתור חשב זמני היום*/}
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <button
                onClick={getZmanim}
                style={{
                  padding: "15px 40px",
                  fontSize: "18px",
                  fontWeight: "600",
                  background: "linear-gradient(45deg, #27ae60, #2ecc71)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  boxShadow: "0 5px 15px rgba(46, 204, 113, 0.3)",
                  transition: "all 0.3s ease",
                  transform: "translateY(0)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 7px 20px rgba(46, 204, 113, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 5px 15px rgba(46, 204, 113, 0.3)";
                }}
              >
                {currentLangData?.dir === "rtl" ? (
                  <>
                    {t.calculate}
                    <span style={{ marginLeft: "8px" }}>🔍</span>
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: "8px" }}>🔍</span>
                    {t.calculate}
                  </>
                )}
              </button>
            </div>

            {/* Results */}
            {(alot90 || error) && (
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "25px",
                  borderRadius: "15px",
                  border: "2px solid #e9ecef",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px 0",
                    color: "#2c3e50",
                    fontSize: "clamp(1.2rem, 3.5vw, 1.5rem)",
                    textAlign: "center",
                    borderBottom: "2px solid #3498db",
                    paddingBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {currentLangData?.dir === "rtl" ? (
                    <>
                      {currentLanguage === "he"
                        ? `זמני התפילה ל${locationName}`
                        : `Prayer Times for ${locationName}`}
                      <span>🕐</span>
                    </>
                  ) : (
                    <>
                      <span>🕐</span>
                      {currentLanguage === "he"
                        ? `זמני התפילה ל${locationName}`
                        : `Prayer Times for ${locationName}`}
                    </>
                  )}
                </h3>

                {error && (
                  <div
                    style={{
                      color: "#e74c3c",
                      backgroundColor: "#fadbd8",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "20px",
                      border: "1px solid #e74c3c",
                    }}
                  >
                    {currentLangData?.dir === "rtl" ? (
                      <>{error} ❌</>
                    ) : (
                      <>❌ {error}</>
                    )}
                  </div>
                )}

                <div
                  className="card-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "15px",
                    padding: "0 5px",
                  }}
                >
                  {/* Morning Times */}
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "15px",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h4
                      style={{
                        color: "#e67e22",
                        marginTop: "0",
                        marginBottom: "15px",
                        fontSize: "clamp(1rem, 3vw, 1.2rem)",
                        borderBottom: "1px solid #e67e22",
                        paddingBottom: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexDirection:
                          currentLangData?.dir === "rtl" ? "row" : "row",
                      }}
                    >
                      {currentLangData?.dir === "rtl" ? (
                        <>
                          {t.morningTimes}
                          <span>🌅</span>
                        </>
                      ) : (
                        <>
                          <span>🌅</span>
                          {t.morningTimes}
                        </>
                      )}
                    </h4>
                    {alot90 && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he" ? "עלות השחר:" : "Dawn:"}
                        </strong>{" "}
                        {alot90}
                      </p>
                    )}
                    {alot72 && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? "עלות השחר (72 דק'):"
                            : "Dawn (72 min):"}
                        </strong>{" "}
                        {alot72}
                      </p>
                    )}
                    {talitTefillin && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? "טלית ותפילין:"
                            : "Tallit & Tefillin:"}
                        </strong>{" "}
                        {talitTefillin}
                      </p>
                    )}
                    {zricha && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he" ? "זריחה:" : "Sunrise:"}
                        </strong>{" "}
                        {zricha}
                      </p>
                    )}
                    {sofShemaMGA && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? 'סוף זמן קריאת שמע (מג"א):'
                            : "Latest Shema (MGA):"}
                        </strong>{" "}
                        {sofShemaMGA}
                      </p>
                    )}
                    {sofShemaGRA && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? 'סוף זמן קריאת שמע (גר"א):'
                            : "Latest Shema (GRA):"}
                        </strong>{" "}
                        {sofShemaGRA}
                      </p>
                    )}
                    {sofTefilaMGA && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? 'סוף זמן תפילה (מג"א):'
                            : "Latest Tefillah (MGA):"}
                        </strong>{" "}
                        {sofTefilaMGA}
                      </p>
                    )}
                    {sofTefilaGRA && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? 'סוף זמן תפילה (גר"א):'
                            : "Latest Tefillah (GRA):"}
                        </strong>{" "}
                        {sofTefilaGRA}
                      </p>
                    )}
                  </div>

                  {/* Day Times */}
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "15px",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h4
                      style={{
                        color: "#f39c12",
                        marginTop: "0",
                        marginBottom: "15px",
                        fontSize: "clamp(1rem, 3vw, 1.2rem)",
                        borderBottom: "1px solid #f39c12",
                        paddingBottom: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {currentLangData?.dir === "rtl" ? (
                        <>
                          {t.dayTimes}
                          <span>☀️</span>
                        </>
                      ) : (
                        <>
                          <span>☀️</span>
                          {t.dayTimes}
                        </>
                      )}
                    </h4>
                    {chatzot && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he" ? "חצות היום:" : "Midday:"}
                        </strong>{" "}
                        {chatzot}
                      </p>
                    )}
                    {minchaGedola && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? "מנחה גדולה:"
                            : "Mincha Gedola:"}
                        </strong>{" "}
                        {minchaGedola}
                      </p>
                    )}
                    {minchaKetana && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? "מנחה קטנה:"
                            : "Mincha Ketana:"}
                        </strong>{" "}
                        {minchaKetana}
                      </p>
                    )}
                    {shkiya && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he" ? "שקיעה:" : "Sunset:"}
                        </strong>{" "}
                        {shkiya}
                      </p>
                    )}
                  </div>

                  {/* Evening Times */}
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "15px",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h4
                      style={{
                        color: "#8e44ad",
                        marginTop: "0",
                        marginBottom: "15px",
                        fontSize: "clamp(1rem, 3vw, 1.2rem)",
                        borderBottom: "1px solid #8e44ad",
                        paddingBottom: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {currentLangData?.dir === "rtl" ? (
                        <>
                          {t.eveningTimes}
                          <span>🌙</span>
                        </>
                      ) : (
                        <>
                          <span>🌙</span>
                          {t.eveningTimes}
                        </>
                      )}
                    </h4>
                    {tzait && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? "צאת הכוכבים:"
                            : "Nightfall:"}
                        </strong>{" "}
                        {tzait}
                      </p>
                    )}
                    {chatzotHaLayla && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? "חצות הלילה:"
                            : "Midnight:"}
                        </strong>{" "}
                        {chatzotHaLayla}
                      </p>
                    )}
                  </div>

                  {/* Shabbat Times */}
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "15px",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h4
                      style={{
                        color: "#2980b9",
                        marginTop: "0",
                        marginBottom: "15px",
                        fontSize: "clamp(1rem, 3vw, 1.2rem)",
                        borderBottom: "1px solid #2980b9",
                        paddingBottom: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {currentLangData?.dir === "rtl" ? (
                        <>
                          {t.shabbatTimes}
                          <span>🕯️</span>
                        </>
                      ) : (
                        <>
                          <span>🕯️</span>
                          {t.shabbatTimes}
                        </>
                      )}
                    </h4>
                    {kenisatShabbat22 && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? "כניסת שבת (22 דק'):"
                            : "Candle Lighting (22 min):"}
                        </strong>{" "}
                        {kenisatShabbat22}
                      </p>
                    )}
                    {kenisatShabbat30 && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? "כניסת שבת (30 דק'):"
                            : "Candle Lighting (30 min):"}
                        </strong>{" "}
                        {kenisatShabbat30}
                      </p>
                    )}
                    {kenisatShabbat40 && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? "כניסת שבת (40 דק'):"
                            : "Candle Lighting (40 min):"}
                        </strong>{" "}
                        {kenisatShabbat40}
                      </p>
                    )}
                    {yetziatShabbat && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        <strong>
                          {currentLanguage === "he"
                            ? "יציאת שבת:"
                            : "Havdalah:"}
                        </strong>{" "}
                        {yetziatShabbat}
                      </p>
                    )}
                    {parasha && (
                      <p style={{ color: "#2c3e50", margin: "8px 0" }}>
                        {currentLanguage === "he"
                          ? "פרשת השבוע:"
                          : "Torah Portion:"}{" "}
                        {parasha}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            color: "white",
            fontSize: "14px",
            opacity: "0.8",
          }}
        >
          <p>{t.footer}</p>
        </div>
      </div>
    </>
  );
}
