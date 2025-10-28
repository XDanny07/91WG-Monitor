import fs from "fs";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { readData, findMissingIds, consecutiveTypeStats } from "./analytics.js";

const app = express();
app.use(cors());

// ---------------- DASHBOARD ----------------
app.get("/", (req, res) => {
  res.send(`
    <h1>Lottery Analytics Dashboard</h1>
    <button onclick="location.href='/missing-ids'">Check Missing IDs</button>
    <button onclick="location.href='/consecutive-stats'">Consecutive Type Stats</button>
    <button onclick="location.href='/download'">Download Data</button>
  `);
});

// ---------------- MISSING IDS ----------------
app.get("/missing-ids", (req, res) => {
  const data = readData();
  const missing = findMissingIds(data);

  res.send(`
    <h2>Missing IDs</h2>
    <p>${missing.length ? missing.join(", ") : "No missing IDs found!"}</p>
    <button onclick="location.href='/'">Back</button>
  `);
});

// ---------------- CONSECUTIVE TYPE STATS ----------------
app.get("/consecutive-stats", (req, res) => {
  const data = readData();
  const stats = consecutiveTypeStats(data);

  const formatStats = (type) => {
    const runs = stats[type];
    return Object.keys(runs)
      .sort((a, b) => b - a)
      .map(
        (len) =>
          `${type} came consecutively ${len} times, ${runs[len]} occurrence(s)`
      )
      .join("<br>");
  };

  res.send(`
    <h2>Consecutive Type Stats</h2>
    <div>${formatStats("Big")}</div><br>
    <div>${formatStats("Small")}</div>
    <button onclick="location.href='/'">Back</button>
  `);
});

// ---------------- DOWNLOAD DATA ----------------
app.get("/download", (req, res) => {
  res.download("data.txt", "data.txt");
});

// ---------------- FETCHING LOGIC ----------------
let lastid = -1;
let isFetching = false;

const clientHints = [
  {
    "sec-ch-ua":
      '"Chromium";v="117", "Not?A_Brand";v="8", "Google Chrome";v="117"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  },
  {
    "sec-ch-ua":
      '"Chromium";v="117", "Not?A_Brand";v="8", "Google Chrome";v="117"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
  },
  {
    "sec-ch-ua":
      '"Microsoft Edge";v="116", "Not?A_Brand";v="8", "Chromium";v="116"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Mac OS X"',
  },
];

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/116.0.5845.111 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
  "Mozilla/5.0 (Linux; Android 14; iQOO 13) AppleWebKit/537.36 Chrome/117.0.0.0 Mobile Safari/537.36",
];

function randomInterval(min = 35000, max = 45000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function fetchData() {
  const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
  const randomCH = clientHints[Math.floor(Math.random() * clientHints.length)];
  const ts = Date.now() + Math.floor(Math.random() * 1000 - 500);

  try {
    const response = await fetch(
      `https://draw.ar-lottery01.com/WinGo/WinGo_3M/GetHistoryIssuePage.json?ts=${ts}`,
      {
        method: "GET",
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          priority: "u=1, i",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "User-Agent": randomUA,
          "sec-ch-ua": randomCH["sec-ch-ua"],
          "sec-ch-ua-mobile": randomCH["sec-ch-ua-mobile"],
          "sec-ch-ua-platform": randomCH["sec-ch-ua-platform"],
        },
      }
    );

    const data = await response.json();
    if (!data?.data?.list?.length) return;

    const item = data.data.list[0];
    const idx = Number(item.issueNumber.toString().slice(-4));

    const ch =
      `{'id':${item.issueNumber},` +
      `'num':${item.number},` +
      `'col':'${item.color}',` +
      (item.number >= 5 ? "'type':'B'}" : "'type':'S'}") +
      ",\n";

    if (lastid === -1 || (idx - lastid + 480) % 480 === 1) {
      lastid = idx;
      fs.appendFileSync("data.txt", ch);
      console.log(new Date(), "Logged:", item.issueNumber);
    }
  } catch (err) {
    console.log("Fetch error:", err.message);
  }
}

async function loop() {
  if (!isFetching) {
    isFetching = true;
    await fetchData();
    isFetching = false;
  } else {
    console.log("Skipping this cycle, previous call still in progress.");
  }
  setTimeout(loop, randomInterval());
}

loop();

app.listen(5000, "0.0.0.0", () => console.log("Server running on port 5000"));
