import { calculateZmanInputs } from "./utils/zmanCalculator";
import { getIsraelOffsetHours } from "./utils/timezone";
import { HDate, Parsha } from "@hebcal/core";
import { getParashaSpecial } from "./utils/parasha.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { latitude, longitude, date } = req.body;

  // Parse the input date correctly - handle both Date objects and strings
  let day, israelMidnight;

  if (date instanceof Date) {
    day = new Date(date);
    israelMidnight = new Date(date);
  } else {
    day = new Date(date + "T00:00:00.000Z"); // Parse as UTC midnight
    israelMidnight = new Date(date); // This will parse 'date' as local time 00:00:00
  }

  israelMidnight.setHours(0, 0, 0, 0); // Ensure it's exactly midnight in local time
  console.log(
    `israelMidnight (local init): toString(): ${israelMidnight.toString()} toISOString(): ${israelMidnight.toISOString()}`
  );

  const hdate = new HDate(israelMidnight);
  const parasha = getParashaSpecial(israelMidnight);
  // console.log(hdate)
  // console.log(parasha)

  // console.log("🔍 Parsed day:",
  // "toString():", day.toString(),
  // "toISOString():", day.toISOString()
  // );
  console.log(`📅 Input date: "${date}"`);
  console.log(`🌍 Israel midnight (UTC): ${israelMidnight.toString()}`);

  // Calculate timezone shift
  const shift = getIsraelOffsetHours(day);
  console.log(`⏰ Israel timezone shift: UTC+${shift}`);

  console.log(`\n🕯️ ═══ KENISAT SHABBAT CALCULATION ═══`);
  // Find the upcoming Friday
  const dow = israelMidnight.getDay(); // 0=Sunday, 1=Monday, ..., 5=Friday, 6=Saturday
  console.log(`📆 Day of week: ${dow}`);

  let daysToFriday;

  if (dow === 5) {
    // If today IS Friday, use today (0 days)
    daysToFriday = 0;
    console.log(`✅ Today IS Friday - using today`);
  } else if (dow === 6) {
    // If today is Saturday, get next Friday (6 days ahead)
    daysToFriday = 6;
    console.log(`📅 Today is Saturday - next Friday is 6 days ahead`);
  } else {
    // Sunday(0) through Thursday(4) - get this week's Friday
    daysToFriday = 5 - dow;
    console.log(`📅 This week's Friday is ${daysToFriday} days ahead`);
  }

  let daysToMotzash;

  if (dow === 6) {
    // If today IS Saturday, use today (0 days)
    daysToMotzash = 0;
    console.log(`✅ Today IS Saturday - using today`);
  } else {
    daysToMotzash = 6 - dow;
    console.log(`📅 This week's Saturday is ${daysToMotzash} days ahead`);
  }

  // Calculate Friday's date
  const fridayDate = new Date(date + "T00:00:00.000Z");
  fridayDate.setDate(fridayDate.getDate() + daysToFriday);
  const fridayShift = getIsraelOffsetHours(fridayDate);
  const { shkiya: shkiyaFri } = calculateZmanInputs(
    fridayDate,
    fridayShift,
    latitude,
    longitude
  );

  // Calculate Motzash date
  const MotzashDate = new Date(date + "T00:00:00.000Z");
  MotzashDate.setDate(MotzashDate.getDate() + daysToMotzash);
  const MotzashShift = getIsraelOffsetHours(MotzashDate);
  const { shkiya: shkiyaMotzash } = calculateZmanInputs(
    MotzashDate,
    MotzashShift,
    latitude,
    longitude
  );
  console.log(MotzashDate);
  console.log(MotzashShift);

  // Calculate Kenisat Shabbat times
  const kenisatShabbat22 = new Date(shkiyaFri.getTime() - 22 * 60_000);
  const kenisatShabbat30 = new Date(shkiyaFri.getTime() - 30 * 60_000);
  const kenisatShabbat40 = new Date(shkiyaFri.getTime() - 40 * 60_000);
  const yetziatShabbat = new Date(shkiyaMotzash.getTime() + 35 * 60_000);

  // console.log(`🕯️  Kenisat Shabbat (22 min): ${kenisatShabbat22.toISOString()}`);
  // console.log(`🕯️  Kenisat Shabbat (30 min): ${kenisatShabbat30.toISOString()}`);
  // console.log(`🕯️  Kenisat Shabbat (40 min): ${kenisatShabbat40.toISOString()}`);

  const {
    alot90,
    alot72,
    talitTefillin,
    zricha,
    musafGRA,
    startOfTenthHourGRA,
    startOfTenthHourMGA,
    fourthHourGRA,
    fourthHourMGA,
    fifthHourGRA,
    fifthHourMGA,
    minchaGedola,
    minchaKetana,
    shkiya,
    plagMincha,
    chatzot,
    tzait,
    tzait90,
    chatzotHaLayla,
    sofZmanShemaMGA,
    sofZmanShemaGRA,
    sofZmanTefilaMGA,
    sofZmanTefilaGRA,
  } = calculateZmanInputs(day, shift, latitude, longitude);

  // 4. Return it as an ISO string
  return res.status(200).json({
    alot90: alot90.toISOString(),
    alot72: alot72.toISOString(),
    talitTefillin: talitTefillin.toISOString(),
    zricha: zricha.toISOString(),
    musafGRA: musafGRA.toISOString(),
    startOfTenthHourGRA: startOfTenthHourGRA.toISOString(),
    startOfTenthHourMGA: startOfTenthHourMGA.toISOString(),
    fourthHourGRA: fourthHourGRA.toISOString(),
    fourthHourMGA: fourthHourMGA.toISOString(),
    fifthHourGRA: fifthHourGRA.toISOString(),
    fifthHourMGA: fifthHourMGA.toISOString(),
    minchaGedola: minchaGedola.toISOString(),
    minchaKetana: minchaKetana.toISOString(),
    shkiya: shkiya.toISOString(),
    chatzot: chatzot.toISOString(),
    plagMincha: plagMincha.toISOString(),
    tzait: tzait.toISOString(),
    tzait90: tzait90.toISOString(),
    chatzotHaLayla: chatzotHaLayla.toISOString(),
    kenisatShabbat22: kenisatShabbat22.toISOString(),
    kenisatShabbat30: kenisatShabbat30.toISOString(),
    kenisatShabbat40: kenisatShabbat40.toISOString(),
    sofZmanShemaMGA: sofZmanShemaMGA.toISOString(),
    sofZmanShemaGRA: sofZmanShemaGRA.toISOString(),
    sofZmanTefilaMGA: sofZmanTefilaMGA.toISOString(),
    sofZmanTefilaGRA: sofZmanTefilaGRA.toISOString(),
    yetziatShabbat: yetziatShabbat.toISOString(),
    parasha: parasha,
  });
}
