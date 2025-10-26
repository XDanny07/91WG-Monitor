import fs from "fs";
import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.get("/", (req, res) => {
  res.end("Server Running :)");
});

var lastid = -1;
var isFetching = false;

async function fetchData() {
  fetch(
    "https://draw.ar-lottery01.com/WinGo/WinGo_3M/GetHistoryIssuePage.json?ts=1761472614820",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Microsoft Edge";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
      },
      body: null,
      method: "GET",
    }
  )
    .then((data) => data.json())
    .then((dat) => {
      let a = "";
      a += dat.data.list[0].issueNumber.toString();
      var idx = Number(a.slice(-4));
      var ch = "{'id':" + dat.data.list[0].issueNumber + ",";
      ch += "'num':" + dat.data.list[0].number + ",";
      ch += "'col':'" + dat.data.list[0].color.toString() + "',";
      ch += dat.data.list[0].number >= 5 ? "'type':'B'},\n" : "'type':'S'},\n";
      if (lastid == -1 || (idx - lastid + 2880) % 2880 == 1) {
        lastid = Number(idx);
        fs.appendFileSync("data.txt", ch);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

app.get("/showdata", (req, res) => {
  fs.readFile("data.txt", "utf-8", (err, data) => {
    if (err) res.end("Some error has occured");
    res.write(data, () => res.end().status(200));
  });
});

app.get("/size", async (req, res) => {
  await fs.promises
    .stat("data.txt", (err) => {
      if (err) res.end(err);
    })
    .then((dat) => {
      res.write("Size : " + dat.size + " bytes", () => res.end().status(200));
      return;
    })
    .catch((err) => res.end("Error Occured"));
});

app.get("/getandclear", (req, res) => {
  fs.readFile("data.txt", "utf-8", (err, data) => {
    if (err) res.end("Some error has occured");
    fs.writeFile("data.txt", "", () => console.log("Done"));
    if (data.length != 0) res.write(data, () => res.end().status(200));
    else res.write("File is empty", () => res.end().status(200));
  });
});

setInterval(async () => {
  if (!isFetching) {
    isFetching = true;
    await fetchData();
    isFetching = false;
  } else {
    console.log("Skipping this cycle, previous call still in progress.");
  }
}, 45000);

app.listen(5000, "0.0.0.0", () => console.log("server"));
