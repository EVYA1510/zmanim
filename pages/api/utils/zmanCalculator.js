// pages/api/utils/zmanCalculator.js

/**
 * Compute solar intermediate values for a given date and longitude.
 * @param {Date} day         — JavaScript Date (local or UTC, we only use its Y/M/D)
 * @param {number} longitude — in decimal degrees (e.g. 35.25)
 * @returns {Object}         — { E, G, L, alpha, delta, epsilon, lambda, averageMidday }
 */
export function calculateIntermediateValues(day, longitude) {
  // 1) Convert longitude into “minutes offset” from prime meridian:
  //    In C#: double lon = -longitude; averageMidday0 = lon * 4
  const lon = -longitude;
  const averageMidday = lon * 4; // in minutes

  // 2) Days since epoch (Jan 1 2000)
  const epoch = new Date(2000, 0, 1); // months are 0-based
  const diffMs = day.getTime() - epoch.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const numberOfDays = Math.trunc(diffDays);

  // 3) Break averageMidday into h:m:s
  const totalHours = averageMidday / 60;
  const hour = Math.round(totalHours);
  const minute = Math.round((totalHours - hour) * 60);
  const second = Math.round(((totalHours - hour) * 60 - minute) * 60);

  // 4) Convert to fraction of a day
  const avgMidFrac = hour / 24 + minute / 1440 + second / 86400;
  const daysSince = numberOfDays - avgMidFrac;

  // 5) Mean longitude of the sun L (degrees)
  const l0 = 280.461 + 0.9856474 * daysSince;
  const L = l0 % 360;

  // 6) Sun’s mean anomaly G (degrees)
  const g0 = 357.528 + 0.9856003 * daysSince;
  const G = g0 % 360;

  // 7) Sun’s true longitude λ (degrees)
  const lambda0 =
    L +
    1.915 * Math.sin((G * Math.PI) / 180) +
    0.02 * Math.sin((2 * G * Math.PI) / 180);
  const lambda = lambda0 % 360;

  // 8) Obliquity of the ecliptic ε (≈23.44°)
  const epsilon = 23.44;

  // 9) Sun’s right ascension α (degrees)
  let alpha =
    (Math.atan(
      Math.tan((lambda * Math.PI) / 180) * Math.cos((epsilon * Math.PI) / 180)
    ) *
      180) /
    Math.PI;
  // Normalize into [0,180)
  if (alpha > 0) alpha = alpha % 180;
  while (alpha < 0) alpha += 180;

  // 10) Equation of time E (minutes)
  let E = (alpha - L) * 4; // 4 minutes per degree
  E = E % 60;
  while (E < -20) E += 60; // match C#’s correction

  // 11) Sun’s declination δ (degrees)
  const delta =
    (Math.asin(
      Math.sin((lambda * Math.PI) / 180) * Math.sin((epsilon * Math.PI) / 180)
    ) *
      180) /
    Math.PI;

  // Return exactly the same eight values
  return { E, G, L, alpha, delta, epsilon, lambda, averageMidday };
}

/**
 * Calculate solar noon (chatzot) for a given date, DST‐shift, and longitude.
 *
 * @param {Date}   day        — the date for which to compute noon
 * @param {number} shift      — UTC offset in hours (e.g. 2 or 3)
 * @param {number} longitude  — decimal degrees (positive east)
 * @returns {Date}            — JavaScript Date for solar noon
 */
export function calculateMidday(day, shift, longitude) {
  const { averageMidday, E } = calculateIntermediateValues(day, longitude);
  const hatzotOffsetMin = 12 * 60 - averageMidday + shift * 60 + E;
  // truncate to integer milliseconds
  const hatzotOffsetMs = Math.trunc(hatzotOffsetMin * 60 * 1000);

  const chatzot = new Date(day.getTime() + hatzotOffsetMs);
  console.log(
    "[Debug calculateMidday]",
    " day:",
    day.toISOString(),
    " shift:",
    shift,
    " avgMid:",
    averageMidday,
    " E:",
    E,
    " offsetMin:",
    hatzotOffsetMin,
    " offsetMs:",
    hatzotOffsetMs,
    " chatzot:",
    chatzot.toString()
  );

  return new Date(day.getTime() + hatzotOffsetMs);
}

/**
 * Calculate the millisecond offset from solar noon for a given sun‐angle.
 *
 * @param {number} angle     — sun altitude in degrees (negative for below horizon)
 * @param {Date}   day       — the date
 * @param {number} latitude  — decimal degrees
 * @param {number} longitude — decimal degrees
 * @returns {number}         — offset in milliseconds (to subtract or add to chatzot)
 */
export function calculateOffsetOfAngle(angle, day, latitude, longitude) {
  const { delta } = calculateIntermediateValues(day, longitude);

  const sinDeg = (d) => Math.sin((d * Math.PI) / 180);
  const cosDeg = (d) => Math.cos((d * Math.PI) / 180);

  const numerator = sinDeg(angle) - sinDeg(latitude) * sinDeg(delta);
  const denominator = cosDeg(latitude) * cosDeg(delta);
  const arcRad = Math.acos(numerator / denominator);
  const arcDeg = (arcRad * 180) / Math.PI;
  const hoursOffset = arcDeg / 15;

  // truncate to integer milliseconds
  return Math.trunc(hoursOffset * 60 * 60 * 1000);
}

/**
 * Compute all zmanim inputs for a given date, shift, and location.
 *
 * @param {Date}   day        — the date
 * @param {number} shift      — UTC offset in hours (e.g. 2 or 3)
 * @param {number} latitude   — decimal degrees
 * @param {number} longitude  — decimal degrees
 * @returns {Object}          — same shape as C# ZmanInputs
 */
export function calculateZmanInputs(day, shift, latitude, longitude) {
  // 1) solar noon
  const chatzot = calculateMidday(day, shift, longitude);
  const chatzotHaLayla = new Date(chatzot.getTime() + 12 * 60 * 60 * 1000);

  // 2) offsets for each angle and apply offset to get the actual Date
  const alot90OffsetMs = calculateOffsetOfAngle(
    -19.75,
    day,
    latitude,
    longitude
  );
  const alot90 = new Date(chatzot.getTime() - alot90OffsetMs);

  const alot72OffsetMs = calculateOffsetOfAngle(
    -15.99,
    day,
    latitude,
    longitude
  );
  const alot72 = new Date(chatzot.getTime() - alot72OffsetMs);

  const talitTefillinOffsetMs = calculateOffsetOfAngle(
    -11.5,
    day,
    latitude,
    longitude
  );
  const talitTefillin = new Date(chatzot.getTime() - talitTefillinOffsetMs);

  const zrichaOffsetMs = calculateOffsetOfAngle(
    -0.8333,
    day,
    latitude,
    longitude
  );
  const zricha = new Date(chatzot.getTime() - zrichaOffsetMs);

  const shkiyaMs = chatzot.getTime() + (chatzot.getTime() - zricha.getTime());
  const shkiya = new Date(shkiyaMs);

  const tzaitOffsetMs = calculateOffsetOfAngle(-4.65, day, latitude, longitude);
  const tzait = new Date(chatzot.getTime() + tzaitOffsetMs);
  const tzait90 = new Date(
    chatzot.getTime() + (chatzot.getTime() - alot72.getTime())
  );

  const shaaZmanitGra = (chatzot.getTime() - zricha.getTime()) / 6;
  const shaaZmanitMagenAvraham = (chatzot.getTime() - alot72.getTime()) / 6;

  const sofZmanShemaMGA = new Date(
    alot72.getTime() + shaaZmanitMagenAvraham * 3
  );
  const sofZmanShemaGRA = new Date(zricha.getTime() + shaaZmanitGra * 3);
  const sofZmanTefilaMGA = new Date(
    alot72.getTime() + shaaZmanitMagenAvraham * 4
  );
  const sofZmanTefilaGRA = new Date(zricha.getTime() + shaaZmanitGra * 4);
  const musafGRA = new Date(zricha.getTime() + shaaZmanitGra * 7);
  const startOfTenthHourGRA = new Date(zricha.getTime() + shaaZmanitGra * 9);
  const startOfTenthHourMGA = new Date(
    alot72.getTime() + shaaZmanitMagenAvraham * 9
  );
  const fourthHourGRA = new Date(zricha.getTime() + shaaZmanitGra * 4);
  const fourthHourMGA = new Date(alot72.getTime() + shaaZmanitMagenAvraham * 4);
  const fifthHourGRA = new Date(zricha.getTime() + shaaZmanitGra * 5);
  const fifthHourMGA = new Date(alot72.getTime() + shaaZmanitMagenAvraham * 5);

  const minchaGedola = new Date(zricha.getTime() + shaaZmanitGra * 6.5);
  const minchaKetana = new Date(zricha.getTime() + shaaZmanitGra * 9.5);
  const plagMincha = new Date(shkiya.getTime() - shaaZmanitGra * 1.25);

  // 4) return only what we need for now
  return {
    alot90,
    alot72,
    talitTefillin,
    zricha,
    sofZmanTefilaGRA,
    sofZmanShemaMGA,
    sofZmanShemaGRA,
    sofZmanTefilaMGA,
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
    chatzot,
    plagMincha,
    tzait,
    tzait90,
    chatzotHaLayla,
  };
}
