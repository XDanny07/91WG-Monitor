import fs from "fs";
import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.get("/", (req, res) => {
  res.end("Server Running :)");
});
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

setInterval(() => {
  fetch("https://91clubapi.com/api/webapi/GetNoaverageEmerdList", {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-GB,en;q=0.9",
      authorization: process.env.BEARER,
      "content-type": "application/json;charset=UTF-8",
      priority: "u=1, i",
      "sec-ch-ua": '"Brave";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1",
      Referer: "https://91club.bet/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: '{"pageSize":10,"pageNo":1,"typeId":30,"language":0,"random":"0958f97dd1214613be0505a8a0d4ba77","signature":"E73851EFA6DEAB2F29794C16F29C063A","timestamp":1728590405}',
    method: "POST",
  })
    .then((data) => data.json())
    .then((dat) => {
      var ch = "{'id':" + dat.data.list[0].issueNumber + ",";
      ch +=
        dat.data.list[0].number >= 5
          ? "'type':'Big'},\n"
          : "'type':'Small'},\n";
      fs.appendFileSync("data.txt", ch);
      // dat.data.list.forEach((element) => {
      //   console.log(element);
      // });
    })
    .catch((err) => {
      console.log(err);
      app.close();
    });
}, 30000);

app.listen(5000, () => console.log("server"));
