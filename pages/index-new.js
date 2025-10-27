import React, { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { isIsraelDST } from "./api/utils/israelDst";
import { getHebrewDate } from "./api/utils/hebrewDate";

// Import components
import PrayerTimeCard from "../components/PrayerTimeCard";
import LocationSelector from "../components/LocationSelector";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

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
  },
};

const fmtZman = (iso) =>
  new Date(iso).toLocaleTimeString("he-IL", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function Home() {
  // Prayer times state
  const [prayerTimes, setPrayerTimes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Date and location state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [currentLocation, setCurrentLocation] = useState({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    name: "ירושלים, ישראל",
  });

  // Hebrew date and holiday state
  const [hebrewDate, setHebrewDate] = useState("");
  const [holiday, setHoliday] = useState("");
  const [dstText, setDstText] = useState("");

  // Language state
  const [currentLanguage, setCurrentLanguage] = useState("he");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Map state
  const [showMap, setShowMap] = useState(false);

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

          setHoliday(holidayText);

          // Update DST status
          const isDst = isIsraelDST(new Date(date));
          setDstText(isDst ? "שעון קיץ" : "שעון חורף");
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
  const getZmanim = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/zmanim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          date: date,
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
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    setShowLanguageDropdown(false);
  };

  const handleMapLocationSelect = (coords) => {
    const { latitude, longitude } = coords;
    const calculationLng = -longitude; // Reverse for calculations

    setCurrentLocation({
      lat: latitude,
      lng: calculationLng,
      name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    });
    setShowMap(false);
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
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
              </div>

              {/* Language Selector */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                >
                  {currentLangData?.flag} {currentLangData?.name}
                </Button>

                {showLanguageDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Date Selection */}
          <Card className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.selectDate}
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Hebrew Date Display */}
              <div className="flex flex-wrap gap-2">
                {hebrewDate && (
                  <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                    {hebrewDate}
                  </div>
                )}
                {holiday && (
                  <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                    {holiday}
                  </div>
                )}
                {dstText && (
                  <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                    {dstText}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Location Selection */}
          <LocationSelector
            onLocationChange={handleLocationChange}
            currentLocation={currentLocation}
            predefinedCities={PREDEFINED_CITIES}
            className="mb-8"
          />

          {/* Map Option */}
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                מפה אינטראקטיבית
              </h3>
              <Button
                variant={showMap ? "primary" : "outline"}
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? "סגור מפה" : "פתח מפה"}
              </Button>
            </div>

            {showMap && (
              <Map
                onLocationSelect={handleMapLocationSelect}
                initialLat={Math.abs(currentLocation.lat)}
                initialLng={Math.abs(currentLocation.lng)}
              />
            )}
          </Card>

          {/* Calculate Button */}
          <div className="text-center mb-8">
            <Button
              onClick={getZmanim}
              loading={loading}
              size="large"
              className="px-8 py-4 text-lg"
            >
              {loading ? "מחשב..." : t.calculate}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Card variant="danger" className="mb-8">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">❌</span>
                <span className="text-red-700">{error}</span>
              </div>
            </Card>
          )}

          {/* Prayer Times Results */}
          {Object.keys(prayerTimes).length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <PrayerTimeCard
                title={t.morningTimes}
                times={morningTimes}
                icon="🌅"
                color="orange"
              />
              <PrayerTimeCard
                title={t.dayTimes}
                times={dayTimes}
                icon="☀️"
                color="yellow"
              />
              <PrayerTimeCard
                title={t.eveningTimes}
                times={eveningTimes}
                icon="🌙"
                color="purple"
              />
              <PrayerTimeCard
                title={t.shabbatTimes}
                times={shabbatTimes}
                icon="🕯️"
                color="blue"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-white/20 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600">{t.footer}</p>
              <div className="mt-4 text-2xl font-bold text-gray-800">
                {t.bsd}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
