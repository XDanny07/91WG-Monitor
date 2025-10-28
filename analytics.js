import fs from "fs";

// Read all data entries from file
export function readData() {
  const raw = fs.readFileSync("data.txt", "utf-8");
  if (!raw) return [];
  // Convert lines to objects
  return raw
    .split(",\n")
    .filter((line) => line.trim())
    .map((line) => {
      const obj = line
        .replace(/'/g, '"') // convert to valid JSON
        .replace(/,$/, "");
      try {
        return JSON.parse(obj);
      } catch (err) {
        console.log("JSON parse error:", err.message, obj);
        return null;
      }
    })
    .filter(Boolean);
}

// ---------- Find missing sequential IDs ----------
export function findMissingIds(data) {
  if (!data.length) return [];

  // Extract last 4 digits
  const idxs = data.map((d) => Number(d.id.toString().slice(-4)));

  const missing = [];
  const total = 480; // wrap-around length

  for (let i = 0; i < idxs.length - 1; i++) {
    let current = idxs[i];
    let next = idxs[i + 1];

    let diff = (next - current + total) % total;
    if (diff > 1) {
      // There are missing IDs between current and next
      for (let j = 1; j < diff; j++) {
        missing.push((current + j) % total);
      }
    }
  }

  return missing;
}

// ---------- Count consecutive same types ----------
export function countConsecutiveTypes(data) {
  const result = [];
  if (!data.length) return result;

  let prevType = data[0].type;
  let count = 1;

  for (let i = 1; i < data.length; i++) {
    if (data[i].type === prevType) {
      count++;
    } else {
      if (count > 1) result.push({ type: prevType, count });
      count = 1;
      prevType = data[i].type;
    }
  }

  if (count > 1) result.push({ type: prevType, count });
  return result;
}

// ---------- Count total occurrences of each type ----------
export function countTotalTypes(data) {
  const totals = { B: 0, S: 0 };
  for (const d of data) {
    if (totals[d.type] !== undefined) totals[d.type]++;
  }
  return totals;
}

// ---------- Count consecutive type runs ----------
export function consecutiveTypeStats(data) {
  const stats = { B: {}, S: {} };
  if (!data.length) return stats;

  let prevType = data[0].type;
  let count = 1;

  for (let i = 1; i < data.length; i++) {
    if (data[i].type === prevType) {
      count++;
    } else {
      if (!stats[prevType][count]) stats[prevType][count] = 0;
      stats[prevType][count]++;
      // Reset
      prevType = data[i].type;
      count = 1;
    }
  }

  // handle the last run
  if (!stats[prevType][count]) stats[prevType][count] = 0;
  stats[prevType][count]++;

  return stats; // { B: {13: 2, 7: 1}, S: {5:3, 2:4} }
}
