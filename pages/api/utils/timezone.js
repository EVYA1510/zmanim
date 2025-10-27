/**
 * Return Israel's offset in hours (2 or 3) for any JS Date.
 */
export function getIsraelOffsetHours(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone:     "Asia/Jerusalem",
    timeZoneName: "short"
  }).formatToParts(date);
  // parts will include e.g. { type: "timeZoneName", value: "GMT+2" }
  const tz = parts.find(p => p.type === "timeZoneName").value;
  console.log(`🌐 [Timezone] Israel offset on ${date.toString()}: ${tz}`); 
  return Number(tz.replace("GMT", "")); 
}
