import React, { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { isIsraelDST } from "./api/utils/israelDst";
import { getHebrewDate } from "./api/utils/hebrewDate";
import { useInitialBoot } from "../hooks/useInitialBoot";
import HydrationGuard from "../components/HydrationGuard";
import LocationCTA from "../components/LocationCTA";
import { DEFAULT_CITIES } from "../lib/boot/types";

// Import modern components
import PrayerTimeCard from "../components/PrayerTimeCard";
import LocationSelector from "../components/LocationSelector";
import HebrewCalendar from "../components/HebrewCalendar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import PrayerTimeHighlight from "../components/PrayerTimeHighlight";
import ThemeToggle from "../components/ThemeToggle";

// Import Map component dynamically
const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">טוען מפה...</p>
      </div>
    </div>
  ),
});

// Constants
const DEFAULT_LAT = 31.7683;
const DEFAULT_LNG = -35.2137;

// Predefined cities (same as original)
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
  { name: "משמר השבעה, ישראל (UTC+2/+3)", lat: 31.8167, lng: -34.8167 },

  // USA - Major Jewish Communities
  { name: "ניו יורק, ארצות הברית (UTC-4/-5)", lat: 40.7128, lng: 74.006 },
  { name: "ברוקלין, ניו יורק (UTC-4/-5)", lat: 40.6782, lng: 73.9442 },
  { name: "לוס אנג'לס, ארצות הברית (UTC-7/-8)", lat: 34.0522, lng: 118.2437 },
  { name: "שיקגו, ארצות הברית (UTC-5/-6)", lat: 41.8781, lng: 87.6298 },
  { name: "מיאמי, ארצות הברית (UTC-4/-5)", lat: 25.7617, lng: 80.1918 },

  // Europe
  { name: "לונדון, אנגליה (UTC+1/+0)", lat: 51.5074, lng: 0.1278 },
  { name: "פריז, צרפת (UTC+2/+1)", lat: 48.8566, lng: -2.3522 },
  { name: "ברלין, גרמניה (UTC+2/+1)", lat: 52.52, lng: -13.405 },
  { name: "רומא, איטליה (UTC+2/+1)", lat: 41.9028, lng: -12.4964 },
  { name: "מדריד, ספרד (UTC+2/+1)", lat: 40.4168, lng: 3.7038 },

  // More cities...
  { name: "טורונטו, קנדה (UTC-4/-5)", lat: 43.6532, lng: 79.3832 },
  { name: "מונטריאול, קנדה (UTC-4/-5)", lat: 45.5017, lng: 73.5673 },
  { name: "מלבורן, אוסטרליה (UTC+11/+10)", lat: -37.8136, lng: -144.9631 },
  { name: "סידני, אוסטרליה (UTC+11/+10)", lat: -33.8688, lng: -151.2093 },
];

// Language options
const LANGUAGES = [
  { code: "he", name: "עברית", flag: "🇮🇱", dir: "rtl" },
  { code: "en", name: "English", flag: "🇺🇸", dir: "ltr" },
  { code: "es", name: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", dir: "ltr" },
];

// Translations
const TRANSLATIONS = {
  he: {
    title: "לוח זמני התפילה",
    subtitle: "זמנים מדויקים לכל מקום בעולם",
    selectDate: "בחר תאריך:",
    selectLocation: "בחר מיקום:",
    calculate: "חשב זמני תפילה",
    morningTimes: "זמני הבוקר",
    dayTimes: "זמני היום",
    eveningTimes: "זמני הערב",
    shabbatTimes: "זמני שבת",
    footer: "זמנים מחושבים על פי הלכה יהודית • מיוצר באהבה לעם ישראל",
    bsd: "בס״ד",
    footerTitle: "לוח זמני התפילה",
    footerSubtitle: "זמנים מדויקים לכל מקום בעולם",
    footerDescription: "מערכת מתקדמת לחישוב זמני תפילה על פי הלכה יהודית",
    footerFeatures: "תכונות:",
    footerFeature1: "זמנים מדויקים לכל מקום",
    footerFeature2: "לוח שנה עברי משולב",
    footerFeature3: "מפה אינטראקטיבית",
    footerFeature4: "תמיכה בשפות מרובות",
    footerLegal: "זמנים מחושבים על פי הלכה יהודית",
    footerMessage: "פותח על ידי מפתחים יהודים למען הקהילה",
    currentDate: "תאריך נוכחי",
    gregorianDate: "תאריך גרגוריאני",
    hebrewDate: "תאריך עברי",
    israelTime: "שעון ישראל",
    locationSelection: "בחירת מיקום",
    citySearch: "חיפוש עיר",
    manualCoordinates: "קורדינאטות ידני",
    interactiveMap: "מפה אינטראקטיבית",
    currentLocation: "מיקום נוכחי",
    prayerTimesFor: "זמני התפילה מוצגים ל-",
    open: "פתח",
    close: "סגור",
    openCalendar: "פתח לוח שנה",
    closeCalendar: "סגור לוח שנה",
    dstSummer: "שעון קיץ",
    dstWinter: "שעון חורף",
    citySearchPlaceholder: "הקלד שם עיר...",
    locationNameLabel: "שם המיקום (אופציונלי)",
    confirm: "אישור",
    clear: "נקה",
    clickMapToSelect: "לחץ על המפה כדי לבחור מיקום",
    currentLocationLabel: "מיקום נוכחי:",
    locationCTA: {
      title: "הפעל שירותי מיקום",
      description: "קבל זמני תפילה מדויקים למיקום הנוכחי שלך",
      enable: "הפעל",
      dismiss: "מאוחר יותר",
      enabling: "מפעיל...",
    },
    // Prayer Times Notifications
    prayerTimesUpdated: "זמני התפילה עודכנו!",
    newTimesAvailable: "זמנים חדשים זמינים",
    moreChanges: "עוד שינויים",
    viewTimes: "צפה בזמנים",
    later: "מאוחר יותר",
    // Smart Reminders
    morningUrgent: "התפילה הבאה: {prayer} בעוד {minutes} דקות",
    morningInfo: "זמן טוב להתכונן לתפילת {prayer}",
    afternoonUrgent: "מנחה בעוד {minutes} דקות",
    afternoonInfo: "זמן טוב לבדוק את זמני המנחה",
    eveningUrgent: "ערבית בעוד {minutes} דקות",
    eveningInfo: "זמן טוב לבדוק את זמני הערב",
  },
  en: {
    title: "Jewish Prayer Times",
    subtitle: "Accurate times for anywhere in the world",
    selectDate: "Select Date:",
    selectLocation: "Select Location:",
    calculate: "Calculate Prayer Times",
    morningTimes: "Morning Times",
    dayTimes: "Day Times",
    eveningTimes: "Evening Times",
    shabbatTimes: "Shabbat Times",
    footer:
      "Times calculated according to Jewish law • Made with love for the Jewish people",
    bsd: 'B"H',
    footerTitle: "Jewish Prayer Times",
    footerSubtitle: "Accurate times for anywhere in the world",
    footerDescription:
      "Advanced system for calculating prayer times according to Jewish law",
    footerFeatures: "Features:",
    footerFeature1: "Accurate times for any location",
    footerFeature2: "Integrated Hebrew calendar",
    footerFeature3: "Interactive map",
    footerFeature4: "Multi-language support",
    footerLegal: "Times calculated according to Jewish law",
    footerMessage: "Developed by Jewish developers for the community",
    locationCTA: {
      title: "Enable Location Services",
      description: "Get accurate prayer times for your current location",
      enable: "Enable",
      dismiss: "Later",
      enabling: "Enabling...",
    },
    // Prayer Times Notifications
    prayerTimesUpdated: "Prayer times updated!",
    newTimesAvailable: "New times available",
    moreChanges: "more changes",
    viewTimes: "View Times",
    later: "Later",
    // Smart Reminders
    morningUrgent: "Next prayer: {prayer} in {minutes} minutes",
    morningInfo: "Good time to prepare for {prayer}",
    afternoonUrgent: "Mincha in {minutes} minutes",
    afternoonInfo: "Good time to check Mincha times",
    eveningUrgent: "Maariv in {minutes} minutes",
    eveningInfo: "Good time to check evening times",
    currentDate: "Current Date",
    gregorianDate: "Gregorian Date",
    hebrewDate: "Hebrew Date",
    israelTime: "Israel Time",
    locationSelection: "Location Selection",
    citySearch: "City Search",
    manualCoordinates: "Manual Coordinates",
    interactiveMap: "Interactive Map",
    currentLocation: "Current Location",
    prayerTimesFor: "Prayer times displayed for",
    open: "Open",
    close: "Close",
    openCalendar: "Open Calendar",
    closeCalendar: "Close Calendar",
    dstSummer: "Summer Time",
    dstWinter: "Winter Time",
    citySearchPlaceholder: "Type city name...",
    locationNameLabel: "Location Name (Optional)",
    confirm: "Confirm",
    clear: "Clear",
    clickMapToSelect: "Click on the map to select location",
    currentLocationLabel: "Current Location:",
    locationCTA: {
      title: "Enable Location Services",
      description: "Get accurate prayer times for your current location",
      enable: "Enable",
      dismiss: "Later",
      enabling: "Enabling...",
    },
  },
  es: {
    title: "Horarios de Oración Judía",
    subtitle: "Horarios precisos para cualquier lugar del mundo",
    selectDate: "Seleccionar Fecha:",
    selectLocation: "Seleccionar Ubicación:",
    calculate: "Calcular Horarios de Oración",
    morningTimes: "Horarios Matutinos",
    dayTimes: "Horarios Diurnos",
    eveningTimes: "Horarios Vespertinos",
    shabbatTimes: "Horarios de Shabat",
    footer:
      "Horarios calculados según la ley judía • Hecho con amor para el pueblo judío",
    bsd: 'B"H',
    footerTitle: "Horarios de Oración Judía",
    footerSubtitle: "Horarios precisos para cualquier lugar del mundo",
    footerDescription:
      "Sistema avanzado para calcular horarios de oración según la ley judía",
    footerFeatures: "Características:",
    footerFeature1: "Horarios precisos para cualquier ubicación",
    footerFeature2: "Calendario hebreo integrado",
    footerFeature3: "Mapa interactivo",
    footerFeature4: "Soporte multiidioma",
    footerLegal: "Horarios calculados según la ley judía",
    footerMessage: "Desarrollado por desarrolladores judíos para la comunidad",
    currentDate: "Fecha Actual",
    gregorianDate: "Fecha Gregoriana",
    hebrewDate: "Fecha Hebrea",
    israelTime: "Hora de Israel",
    locationSelection: "Selección de Ubicación",
    citySearch: "Búsqueda de Ciudad",
    manualCoordinates: "Coordenadas Manuales",
    interactiveMap: "Mapa Interactivo",
    currentLocation: "Ubicación Actual",
    prayerTimesFor: "Horarios de oración mostrados para",
    open: "Abrir",
    close: "Cerrar",
    openCalendar: "Abrir Calendario",
    closeCalendar: "Cerrar Calendario",
    dstSummer: "Hora de Verano",
    dstWinter: "Hora de Invierno",
    citySearchPlaceholder: "Escriba nombre de ciudad...",
    locationNameLabel: "Nombre del Lugar (Opcional)",
    confirm: "Confirmar",
    clear: "Limpiar",
    clickMapToSelect: "Haga clic en el mapa para seleccionar ubicación",
    currentLocationLabel: "Ubicación Actual:",
  },
  fr: {
    title: "Horaires de Prière Juive",
    subtitle: "Horaires précis pour n'importe où dans le monde",
    selectDate: "Sélectionner la Date:",
    selectLocation: "Sélectionner l'Emplacement:",
    calculate: "Calculer les Horaires de Prière",
    morningTimes: "Horaires Matinaux",
    dayTimes: "Horaires Diurnes",
    eveningTimes: "Horaires Vespéraux",
    shabbatTimes: "Horaires de Shabbat",
    footer:
      "Horaires calculés selon la loi juive • Fait avec amour pour le peuple juif",
    bsd: 'B"H',
    footerTitle: "Horaires de Prière Juive",
    footerSubtitle: "Horaires précis pour n'importe où dans le monde",
    footerDescription:
      "Système avancé pour calculer les horaires de prière selon la loi juive",
    footerFeatures: "Caractéristiques:",
    footerFeature1: "Horaires précis pour tout emplacement",
    footerFeature2: "Calendrier hébraïque intégré",
    footerFeature3: "Carte interactive",
    footerFeature4: "Support multilingue",
    footerLegal: "Horaires calculés selon la loi juive",
    footerMessage: "Développé par des développeurs juifs pour la communauté",
    currentDate: "Date Actuelle",
    gregorianDate: "Date Grégorienne",
    hebrewDate: "Date Hébraïque",
    israelTime: "Heure d'Israël",
    locationSelection: "Sélection d'Emplacement",
    citySearch: "Recherche de Ville",
    manualCoordinates: "Coordonnées Manuelles",
    interactiveMap: "Carte Interactive",
    currentLocation: "Emplacement Actuel",
    prayerTimesFor: "Horaires de prière affichés pour",
    open: "Ouvrir",
    close: "Fermer",
    openCalendar: "Ouvrir Calendrier",
    closeCalendar: "Fermer Calendrier",
    dstSummer: "Heure d'Été",
    dstWinter: "Heure d'Hiver",
    citySearchPlaceholder: "Tapez nom de ville...",
    locationNameLabel: "Nom du Lieu (Optionnel)",
    confirm: "Confirmer",
    clear: "Effacer",
    clickMapToSelect: "Cliquez sur la carte pour sélectionner l'emplacement",
    currentLocationLabel: "Emplacement Actuel:",
  },
  de: {
    title: "Jüdische Gebetszeiten",
    subtitle: "Präzise Zeiten für jeden Ort der Welt",
    selectDate: "Datum Auswählen:",
    selectLocation: "Standort Auswählen:",
    calculate: "Gebetszeiten Berechnen",
    morningTimes: "Morgenzeiten",
    dayTimes: "Tageszeiten",
    eveningTimes: "Abendzeiten",
    shabbatTimes: "Schabbatzeiten",
    footer:
      "Zeiten nach jüdischem Gesetz berechnet • Mit Liebe für das jüdische Volk gemacht",
    bsd: 'B"H',
    footerTitle: "Jüdische Gebetszeiten",
    footerSubtitle: "Präzise Zeiten für jeden Ort der Welt",
    footerDescription:
      "Fortschrittliches System zur Berechnung von Gebetszeiten nach jüdischem Gesetz",
    footerFeatures: "Funktionen:",
    footerFeature1: "Präzise Zeiten für jeden Standort",
    footerFeature2: "Integrierter hebräischer Kalender",
    footerFeature3: "Interaktive Karte",
    footerFeature4: "Mehrsprachige Unterstützung",
    footerLegal: "Zeiten nach jüdischem Gesetz berechnet",
    footerMessage: "Entwickelt von jüdischen Entwicklern für die Gemeinschaft",
    currentDate: "Aktuelles Datum",
    gregorianDate: "Gregorianisches Datum",
    hebrewDate: "Hebräisches Datum",
    israelTime: "Israelische Zeit",
    locationSelection: "Standortauswahl",
    citySearch: "Stadtsuche",
    manualCoordinates: "Manuelle Koordinaten",
    interactiveMap: "Interaktive Karte",
    currentLocation: "Aktueller Standort",
    prayerTimesFor: "Gebetszeiten angezeigt für",
    open: "Öffnen",
    close: "Schließen",
    openCalendar: "Kalender Öffnen",
    closeCalendar: "Kalender Schließen",
    dstSummer: "Sommerzeit",
    dstWinter: "Winterzeit",
    citySearchPlaceholder: "Stadtname eingeben...",
    locationNameLabel: "Ortsname (Optional)",
    confirm: "Bestätigen",
    clear: "Löschen",
    clickMapToSelect: "Klicken Sie auf die Karte, um den Standort auszuwählen",
    currentLocationLabel: "Aktueller Standort:",
  },
};

const fmtZman = (iso) =>
  new Date(iso).toLocaleTimeString("he-IL", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

function PrayerTimesApp() {
  // Use boot system for initial state
  const boot = useInitialBoot();

  // Prayer times state
  const [prayerTimes, setPrayerTimes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Date and location state - initialized from boot prefs
  const [date, setDate] = useState(() => {
    if (boot.prefs.lastDateISO) {
      return new Date(boot.prefs.lastDateISO);
    }
    return new Date();
  });

  const [currentLocation, setCurrentLocation] = useState(() => {
    // Clear any saved map location to force Jerusalem default
    if (typeof window !== "undefined") {
      localStorage.removeItem("idf-zmanim:map:view");
    }
    // Always start with Jerusalem, ignore saved preferences
    return DEFAULT_CITIES.JERUSALEM;
  });

  // Hebrew date and holiday state
  const [hebrewDate, setHebrewDate] = useState("");
  const [holiday, setHoliday] = useState("");

  // Language state - initialized from boot prefs
  const [currentLanguage, setCurrentLanguage] = useState(boot.prefs.language);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Theme state
  const [isDark, setIsDark] = useState(false);

  const [expandedSections, setExpandedSections] = useState({
    morning: false,
    day: false,
    evening: false,
    shabbat: false,
  });

  const currentLangData = LANGUAGES.find(
    (lang) => lang.code === currentLanguage
  );
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.he;

  // Update Hebrew date when Gregorian date changes
  useEffect(() => {
    if (date) {
      try {
        const result = getHebrewDate(date);
        if (result) {
          setHebrewDate(result.date);

          // Set holiday text
          let holidayText = "";
          const dayOfWeek = new Date(date).getDay();
          if (dayOfWeek === 6) {
            holidayText = prayerTimes.parasha
              ? `שבת פרשת ${prayerTimes.parasha}`
              : "שבת";
          }

          if (result.holidays && result.holidays.length > 0) {
            if (holidayText) {
              holidayText += ` • ${result.holidays[0]}`;
            } else {
              holidayText = result.holidays[0];
            }
          }
        }
      } catch (error) {
        console.error("Error updating Hebrew date:", error);
      }
    }
  }, [date, prayerTimes.parasha]);

  // Update document direction and language
  useEffect(() => {
    document.documentElement.dir = currentLangData?.dir || "rtl";
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, currentLangData]);

  // Get prayer times from API
  // Normalize coordinates to ensure consistent format
  const normalizeCoordinates = (lat, lng) => {
    // Ensure latitude is within valid range (-90 to 90)
    let normalizedLat = parseFloat(lat);
    if (isNaN(normalizedLat) || normalizedLat < -90 || normalizedLat > 90) {
      console.warn("Invalid latitude:", lat);
      return null;
    }

    // Ensure longitude is within valid range (-180 to 180)
    let normalizedLng = parseFloat(lng);
    if (isNaN(normalizedLng) || normalizedLng < -180 || normalizedLng > 180) {
      console.warn("Invalid longitude:", lng);
      return null;
    }

    // For Israel coordinates, ensure longitude is negative (east of Greenwich)
    if (normalizedLat > 29 && normalizedLat < 34 && normalizedLng > 0) {
      normalizedLng = -normalizedLng;
      console.log("Corrected longitude for Israel:", normalizedLng);
    }

    return { lat: normalizedLat, lng: normalizedLng };
  };

  const getZmanim = async () => {
    setLoading(true);
    setError("");

    try {
      // Normalize coordinates before sending to API
      const normalizedCoords = normalizeCoordinates(
        currentLocation.lat,
        currentLocation.lng
      );

      if (!normalizedCoords) {
        throw new Error("Invalid coordinates");
      }

      console.log(
        "Original coordinates:",
        currentLocation.lat,
        currentLocation.lng
      );
      console.log(
        "Normalized coordinates:",
        normalizedCoords.lat,
        normalizedCoords.lng
      );

      const response = await fetch("/api/zmanim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          latitude: normalizedCoords.lat,
          longitude: normalizedCoords.lng,
          date: date instanceof Date ? date.toISOString().split("T")[0] : date,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // Format times for display
      const formattedTimes = {
        alot90: fmtZman(data.alot90),
        alot72: fmtZman(data.alot72),
        talitTefillin: fmtZman(data.talitTefillin),
        zricha: fmtZman(data.zricha),
        sofShemaMGA: fmtZman(data.sofZmanShemaMGA),
        sofShemaGRA: fmtZman(data.sofZmanShemaGRA),
        sofTefilaMGA: fmtZman(data.sofZmanTefilaMGA),
        sofTefilaGRA: fmtZman(data.sofZmanTefilaGRA),
        chatzot: fmtZman(data.chatzot),
        minchaGedola: fmtZman(data.minchaGedola),
        minchaKetana: fmtZman(data.minchaKetana),
        shkiya: fmtZman(data.shkiya),
        plagMincha: fmtZman(data.plagMincha),
        tzait: fmtZman(data.tzait),
        tzait90: fmtZman(data.tzait90),
        chatzotHaLayla: fmtZman(data.chatzotHaLayla),
        kenisatShabbat22: fmtZman(data.kenisatShabbat22),
        kenisatShabbat30: fmtZman(data.kenisatShabbat30),
        kenisatShabbat40: fmtZman(data.kenisatShabbat40),
        yetziatShabbat: fmtZman(data.yetziatShabbat),
        parasha: data.parasha,
      };

      setPrayerTimes(formattedTimes);
    } catch (e) {
      console.error("Error getting prayer times:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate when date or location changes
  useEffect(() => {
    if (date && currentLocation.lat && currentLocation.lng) {
      getZmanim();
    }
  }, [date, currentLocation]);

  const handleLocationChange = (location) => {
    setCurrentLocation(location);
    setError("");
    // Update preferences
    boot.updatePrefs({ lastCity: location });
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    setShowLanguageDropdown(false);
    // Update preferences
    boot.updatePrefs({ language: langCode });
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    // Update preferences
    boot.updatePrefs({ lastDateISO: newDate.toISOString() });
  };

  // Theme management
  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setIsDark(shouldBeDark);

    // Apply theme immediately
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newState = {
        ...prev,
        [section]: !prev[section],
      };

      // If opening a section, scroll to it after state update
      if (!prev[section]) {
        setTimeout(() => {
          const sectionElement = document.querySelector(
            `[data-section="${section}"]`
          );
          if (sectionElement) {
            sectionElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      }

      return newState;
    });
  };

  // Prepare prayer times data for cards
  const morningTimes = [
    { label: "עלות השחר", value: prayerTimes.alot90 },
    { label: "עלות השחר (72 דק')", value: prayerTimes.alot72 },
    { label: "טלית ותפילין", value: prayerTimes.talitTefillin },
    { label: "זריחה", value: prayerTimes.zricha },
    { label: 'סוף זמן קריאת שמע (מג"א)', value: prayerTimes.sofShemaMGA },
    { label: 'סוף זמן קריאת שמע (גר"א)', value: prayerTimes.sofShemaGRA },
    { label: 'סוף זמן תפילה (מג"א)', value: prayerTimes.sofTefilaMGA },
    { label: 'סוף זמן תפילה (גר"א)', value: prayerTimes.sofTefilaGRA },
  ].filter((time) => time.value);

  const dayTimes = [
    { label: "חצות היום", value: prayerTimes.chatzot },
    { label: "מנחה גדולה", value: prayerTimes.minchaGedola },
    { label: "מנחה קטנה", value: prayerTimes.minchaKetana },
    { label: "שקיעה", value: prayerTimes.shkiya },
  ].filter((time) => time.value);

  const eveningTimes = [
    { label: "צאת הכוכבים", value: prayerTimes.tzait },
    { label: "חצות הלילה", value: prayerTimes.chatzotHaLayla },
  ].filter((time) => time.value);

  const shabbatTimes = [
    { label: "כניסת שבת (22 דק')", value: prayerTimes.kenisatShabbat22 },
    { label: "כניסת שבת (30 דק')", value: prayerTimes.kenisatShabbat30 },
    { label: "כניסת שבת (40 דק')", value: prayerTimes.kenisatShabbat40 },
    { label: "יציאת שבת", value: prayerTimes.yetziatShabbat },
    { label: "פרשת השבוע", value: prayerTimes.parasha, note: "פרשת השבוע" },
  ].filter((time) => time.value);

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Location CTA */}
      {boot.showLocationCTA && (
        <LocationCTA
          onEnable={boot.enableGeolocation}
          onDismiss={boot.dismissLocationCTA}
          isGeolocating={boot.isGeolocating}
          translations={t}
        />
      )}

      <HydrationGuard
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-idf-olive-50 via-idf-olive-100 to-idf-gold-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-idf-olive-600 mx-auto mb-4"></div>
              <p className="text-idf-olive-700 font-medium">טוען...</p>
            </div>
          </div>
        }
      >
        <main
          dir={currentLangData?.dir || "rtl"}
          className="min-h-screen bg-gradient-to-br from-idf-olive-50 via-idf-olive-100 to-idf-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-blue-900 rounded-full opacity-20 dark:opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 dark:bg-purple-900 rounded-full opacity-20 dark:opacity-10 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100 dark:bg-indigo-900 rounded-full opacity-10 dark:opacity-5 blur-3xl"></div>
          </div>
          {/* Header */}
          <div className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 fixed top-0 left-0 right-0 z-[9999] shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Controls moved to bottom left */}

              {/* Logo and Title */}
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-3 sm:space-x-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <img
                      src="/logo.png"
                      alt="לוגו"
                      className="relative h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white/20"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <img
                      src="/idfLogo.avif"
                      alt="לוגו צה״ל"
                      className="relative h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white/20"
                    />
                  </div>
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white text-center sm:text-right mr-4">
                  {t.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-20">
            {/* Top Section - Calendar and Location with Smart Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6">
              {/* Hebrew Calendar - Responsive sizing */}
              <div className="lg:col-span-1 xl:col-span-1">
                <HebrewCalendar
                  currentDate={date}
                  onDateChange={handleDateChange}
                  currentLanguage={currentLanguage}
                  translations={t}
                />
              </div>

              {/* Location Selection - Responsive sizing */}
              <div className="lg:col-span-1 xl:col-span-2">
                <LocationSelector
                  onLocationChange={handleLocationChange}
                  currentLocation={currentLocation}
                  predefinedCities={PREDEFINED_CITIES}
                  className="h-full"
                  translations={t}
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Card variant="danger" className="mb-8">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  <span className="text-red-700 dark:text-red-400">
                    {error}
                  </span>
                </div>
              </Card>
            )}

            {/* Prayer Times Results */}
            {Object.keys(prayerTimes).length > 0 && (
              <div className="mb-4" data-prayer-times>
                {/* Smart Prayer Reminders removed */}

                {/* Location Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                    <span className="text-gray-800 dark:text-gray-200 font-bold text-xl">
                      {t.prayerTimesFor} 📍 {currentLocation.name}
                    </span>
                  </div>
                </div>

                {/* Prayer Times Cards */}
                <div className="space-y-4">
                  {/* Morning Times Section */}
                  <Card
                    className="overflow-hidden border-l-4 border-l-blue-500 dark:border-l-blue-400"
                    data-section="morning"
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={() => toggleSection("morning")}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🌅</span>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {t.morningTimes}
                        </h3>
                      </div>
                      <Button
                        variant="outline"
                        size="small"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100 flex items-center space-x-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSection("morning");
                        }}
                      >
                        <span>{expandedSections.morning ? "✕" : "▼"}</span>
                        <span className="hidden sm:inline">
                          {expandedSections.morning ? t.close : t.open}
                        </span>
                      </Button>
                    </div>
                    {expandedSections.morning && (
                      <div className="px-4 pb-4">
                        <PrayerTimeCard
                          times={morningTimes}
                          icon=""
                          color="blue"
                          showTitle={false}
                        />
                      </div>
                    )}
                  </Card>

                  {/* Day Times Section */}
                  <Card
                    className="overflow-hidden border-l-4 border-l-blue-500 dark:border-l-blue-400"
                    data-section="day"
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={() => toggleSection("day")}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">☀️</span>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {t.dayTimes}
                        </h3>
                      </div>
                      <Button
                        variant="outline"
                        size="small"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100 flex items-center space-x-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSection("day");
                        }}
                      >
                        <span>{expandedSections.day ? "✕" : "▼"}</span>
                        <span className="hidden sm:inline">
                          {expandedSections.day ? t.close : t.open}
                        </span>
                      </Button>
                    </div>
                    {expandedSections.day && (
                      <div className="px-4 pb-4">
                        <PrayerTimeCard
                          times={dayTimes}
                          icon=""
                          color="blue"
                          showTitle={false}
                        />
                      </div>
                    )}
                  </Card>

                  {/* Evening Times Section */}
                  <Card
                    className="overflow-hidden border-l-4 border-l-blue-500 dark:border-l-blue-400"
                    data-section="evening"
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={() => toggleSection("evening")}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🌙</span>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {t.eveningTimes}
                        </h3>
                      </div>
                      <Button
                        variant="outline"
                        size="small"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100 flex items-center space-x-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSection("evening");
                        }}
                      >
                        <span>{expandedSections.evening ? "✕" : "▼"}</span>
                        <span className="hidden sm:inline">
                          {expandedSections.evening ? t.close : t.open}
                        </span>
                      </Button>
                    </div>
                    {expandedSections.evening && (
                      <div className="px-4 pb-4">
                        <PrayerTimeCard
                          times={eveningTimes}
                          icon=""
                          color="blue"
                          showTitle={false}
                        />
                      </div>
                    )}
                  </Card>

                  {/* Shabbat Times Section */}
                  <Card
                    className="overflow-hidden border-l-4 border-l-blue-500 dark:border-l-blue-400"
                    data-section="shabbat"
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={() => toggleSection("shabbat")}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🕯️</span>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {t.shabbatTimes}
                        </h3>
                      </div>
                      <Button
                        variant="outline"
                        size="small"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100 flex items-center space-x-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSection("shabbat");
                        }}
                      >
                        <span>{expandedSections.shabbat ? "✕" : "▼"}</span>
                        <span className="hidden sm:inline">
                          {expandedSections.shabbat ? t.close : t.open}
                        </span>
                      </Button>
                    </div>
                    {expandedSections.shabbat && (
                      <div className="px-4 pb-4">
                        <PrayerTimeCard
                          times={shabbatTimes}
                          icon=""
                          color="blue"
                          showTitle={false}
                        />
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Professional Footer */}
          <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Main Footer Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                {/* Brand Section */}
                <div className="lg:col-span-2">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src="/logo.png"
                        alt="לוגו"
                        className="h-12 w-12 rounded-full border-2 border-white/20"
                      />
                      <img
                        src="/idfLogo.avif"
                        alt="לוגו צה״ל"
                        className="h-12 w-12 rounded-full border-2 border-white/20"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {t.footerTitle}
                      </h3>
                      <p className="text-blue-200 text-sm">
                        {t.footerSubtitle}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {t.footerDescription}
                  </p>
                  <div className="text-xs text-gray-400">{t.footerLegal}</div>
                </div>

                {/* Features Section */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">⭐</span>
                    {t.footerFeatures}
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center">
                      <span className="mr-2">📍</span>
                      {t.footerFeature1}
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">📅</span>
                      {t.footerFeature2}
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">🗺️</span>
                      {t.footerFeature3}
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">🌍</span>
                      {t.footerFeature4}
                    </li>
                  </ul>
                </div>

                {/* Technical Info */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">⚙️</span>
                    {currentLanguage === "he" ? "מידע טכני" : "Technical Info"}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center justify-between">
                      <span>
                        {currentLanguage === "he" ? "גרסה:" : "Version:"}
                      </span>
                      <span className="text-blue-300 font-mono">v2.0.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>
                        {currentLanguage === "he"
                          ? "עדכון אחרון:"
                          : "Last Update:"}
                      </span>
                      <span className="text-blue-300">2024</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>
                        {currentLanguage === "he" ? "תמיכה:" : "Support:"}
                      </span>
                      <span className="text-green-300">✓ Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="border-t border-gray-700 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="text-sm text-gray-400 mb-4 md:mb-0">
                    {t.footerCopyright}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-xs text-gray-500">
                      {t.footerMessage}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>

          {/* Floating Controls - Bottom Left */}
          <div className="fixed bottom-20 left-4 z-[9998]">
            <div className="flex flex-col space-y-3">
              {/* Theme Toggle */}
              <div className="relative group">
                <div
                  onClick={toggleTheme}
                  className="relative w-10 h-10 bg-black border-2 border-gray-800 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer"
                  title={isDark ? "מעבר למצב יום" : "מעבר למצב לילה"}
                  aria-label={isDark ? "מעבר למצב יום" : "מעבר למצב לילה"}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleTheme();
                    }
                  }}
                >
                  <span className="text-white text-sm font-bold">
                    {isDark ? "☀" : "🌙"}
                  </span>
                </div>
              </div>

              {/* Language Selector */}
              <div className="relative group">
                <div
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="relative w-10 h-10 bg-black border-2 border-gray-800 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer"
                  aria-label="בחר שפה"
                  aria-expanded={showLanguageDropdown}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setShowLanguageDropdown(!showLanguageDropdown);
                    }
                  }}
                >
                  <span className="text-white text-sm">
                    {currentLangData?.flag}
                  </span>
                </div>

                {showLanguageDropdown && (
                  <div className="absolute bottom-full left-0 mb-3 w-52 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
                    <div className="p-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        {t.selectLanguage || "בחר שפה"}
                      </div>
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50/80 flex items-center space-x-3 rounded-xl transition-all duration-200 hover:scale-[1.02] group"
                          aria-label={`שנה שפה ל-${lang.name}`}
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                            {lang.flag}
                          </span>
                          <span className="font-medium text-gray-700 group-hover:text-gray-900">
                            {lang.name}
                          </span>
                          {currentLanguage === lang.code && (
                            <span className="ml-auto text-blue-500 text-sm">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </HydrationGuard>
    </>
  );
}

export default function Home() {
  return <PrayerTimesApp />;
}
