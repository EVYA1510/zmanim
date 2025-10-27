// pages/api/utils/israelDst.js

/**
 * Return true if `date` is in Israel Daylight-Saving Time.
 */
export function isIsraelDST(date) {
  const year = date.getFullYear();

  // Find the last Sunday of a given month
  function getLastWeekdayOfMonth(year, month, weekday) {
    // month: 1=Jan, …, 12=Dec
    const lastDay = new Date(year, month, 0);
    const lastDow = lastDay.getDay();
    const diff   = (lastDow - weekday + 7) % 7;
    return new Date(year, month - 1, lastDay.getDate() - diff);
  }

  // C# did: DSTStart = last Sunday of March minus 2 days
  const lastSunMar = getLastWeekdayOfMonth(year, 3, 0);
  const dstStart   = new Date(year, 2, lastSunMar.getDate() - 2);

  // C# did: DSTEnd = last Sunday of October
  const dstEnd     = getLastWeekdayOfMonth(year, 10, 0);

  return date >= dstStart && date < dstEnd;
}
