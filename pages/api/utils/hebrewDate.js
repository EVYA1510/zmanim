// Hebrew date calculation utilities

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

// Hebrew months names - aligned with Intl.DateTimeFormat month numbers
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

// Additional mapping for Hebrew month names from Intl.DateTimeFormat
const HEBREW_MONTH_NAMES = {
  Tishrei: "תשרי",
  Cheshvan: "חשון",
  Kislev: "כסלו",
  Tevet: "טבת",
  Shevat: "שבט",
  Adar: "אדר",
  "Adar I": "אדר א׳",
  "Adar II": "אדר ב׳",
  Nisan: "ניסן",
  Iyar: "אייר",
  Iyyar: "אייר", // Alternative spelling
  Sivan: "סיון",
  Tammuz: "תמוז",
  Tamuz: "תמוז", // Alternative spelling
  Av: "אב",
  Elul: "אלול",
  // Additional variations
  Tishri: "תשרי",
  Cheshvan: "חשון",
  Kislev: "כסלו",
  Tevet: "טבת",
  Shevat: "שבט",
  "Sh'vat": "שבט", // Alternative spelling
  Adar: "אדר",
  Nisan: "ניסן",
  Sivan: "סיון",
  Tammuz: "תמוז",
  Tamuz: "תמוז", // Alternative spelling
  Av: "אב",
  Elul: "אלול",
};

// Hebrew year mapping for common years
const HEBREW_YEARS = {
  5786: "תשפ״ו",
  5787: "תשפ״ז",
  5788: "תשפ״ח",
  5789: "תשפ״ט",
  5790: "תש״ץ",
  5791: "תשצ״א",
  5792: "תשצ״ב",
  5793: "תשצ״ג",
  5794: "תשצ״ד",
  5795: "תשצ״ה",
  5796: "תשצ״ו",
  5797: "תשצ״ז",
  5798: "תשצ״ח",
  5799: "תשצ״ט",
  5800: "תש״ק",
};

// Convert number to Hebrew representation (Gematria)
function numberToHebrew(num) {
  if (num <= 30) {
    return HEBREW_NUMS[num] || "";
  }

  // For year numbers (e.g. תשפ"ה)
  if (num > 5000) {
    // Check if we have a direct mapping first
    if (HEBREW_YEARS[num]) {
      return HEBREW_YEARS[num];
    }

    // For years not in our mapping, use the general algorithm
    const remainder = num % 1000;

    const letters = {
      400: "ת",
      300: "ש",
      200: "ר",
      100: "ק",
      90: "צ",
      80: "פ",
      70: "ע",
      60: "ס",
      50: "נ",
      40: "מ",
      30: "ל",
      20: "כ",
      10: "י",
      9: "ט",
      8: "ח",
      7: "ז",
      6: "ו",
      5: "ה",
      4: "ד",
      3: "ג",
      2: "ב",
      1: "א",
    };

    const values = [
      400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4,
      3, 2, 1,
    ];

    let result = "";
    let n = remainder;

    for (const value of values) {
      while (n >= value) {
        result += letters[value];
        n -= value;
      }
    }

    if (result.length > 1) {
      result = result.slice(0, -1) + "״" + result.slice(-1);
    }

    return result;
  }

  return num.toString();
}

// Get Hebrew holidays for a given date
function getHolidays(hebrewDate) {
  const { month, day } = hebrewDate;
  const holidays = [];

  // Major holidays
  if (month === 7) {
    // Tishri
    if (day === 1) holidays.push("ראש השנה");
    if (day === 2) holidays.push("ראש השנה");
    if (day === 10) holidays.push("יום כיפור");
    if (day === 15) holidays.push("סוכות");
    if (day >= 16 && day <= 21) holidays.push("חול המועד סוכות");
    if (day === 22) holidays.push("שמחת תורה");
  }

  if (month === 1) {
    // Nisan
    if (day === 15) holidays.push("פסח");
    if (day >= 16 && day <= 20) holidays.push("חול המועד פסח");
    if (day === 21) holidays.push("שביעי של פסח");
  }

  if (month === 3 && day === 6) holidays.push("שבועות"); // Sivan

  return holidays;
}

// Main function to convert Gregorian to Hebrew date
export function getHebrewDate(gregorianDate) {
  try {
    // Handle both Date objects and string dates
    let date;
    if (gregorianDate instanceof Date) {
      date = gregorianDate;
    } else if (typeof gregorianDate === "string") {
      const [year, month, day] = gregorianDate.split("-").map(Number);
      if (!year || !month || !day) return null;
      date = new Date(year, month - 1, day);
    } else {
      return null;
    }

    // Use Intl.DateTimeFormat to get the Hebrew date
    const numericFormatter = new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    const monthNameFormatter = new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
      month: "long",
    });

    // Get the Hebrew date parts
    const parts = numericFormatter.formatToParts(date);
    // Get Hebrew month name first
    const monthName = monthNameFormatter.format(date);

    // Find the month number from the month name
    const monthNumber =
      Object.values(HEBREW_MONTHS).findIndex(
        (month) => monthName.includes(month) || month.includes(monthName)
      ) + 1;

    const hebrewDate = {
      day: parseInt(parts.find((p) => p.type === "day")?.value || "1"),
      month: monthNumber > 0 ? monthNumber : 1,
      year: parseInt(parts.find((p) => p.type === "year")?.value || "5786"),
      monthName: monthName,
    };

    // Get holidays
    const holidays = getHolidays(hebrewDate);

    // Format the date in Hebrew
    const hebDay = numberToHebrew(hebrewDate.day);
    const hebYear = numberToHebrew(hebrewDate.year);

    // Get Hebrew month name
    const hebrewMonthName =
      HEBREW_MONTH_NAMES[hebrewDate.monthName] || hebrewDate.monthName;

    return {
      date: `${hebDay}׳ ${hebrewMonthName} ${hebYear}`,
      holidays: holidays,
    };
  } catch (error) {
    console.error("Error converting to Hebrew date:", error);
    return null;
  }
}
