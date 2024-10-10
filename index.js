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
    res.write(data);
    res.end().status(200);
  });
});

app.get("/size", async (req, res) => {
  await fs.promises
    .stat("data.txt", (err) => {
      if (err) res.end(err);
    })
    .then((dat) => {
      res.write("Size : " + dat.size + " bytes");
      res.end().status(200);
    });
  res.end("Error Occured");
});

app.get("/getandclear", (req, res) => {
  fs.readFile("data.txt", "utf-8", (err, data) => {
    if (err) res.end("Some error has occured");
    fs.writeFile("data.txt", "", () => console.log("Done"));
    if (data.length != 0) res.write(data);
    else res.write("File is empty");
    res.end().status(200);
  });
});

setInterval(() => {
  fetch("https://91clubapi.com/api/webapi/GetNoaverageEmerdList", {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-GB,en;q=0.9",
      authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzI4NTkwMzk2IiwibmJmIjoiMTcyODU5MDM5NiIsImV4cCI6IjE3Mjg1OTIxOTYiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiIxMC8xMS8yMDI0IDE6NTk6NTYgQU0iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBY2Nlc3NfVG9rZW4iLCJVc2VySWQiOiI2MTg4NTUiLCJVc2VyTmFtZSI6IjkxNzM1NTczMDIwNiIsIlVzZXJQaG90byI6IjE4IiwiTmlja05hbWUiOiJNZW1iZXJOTkcwV0ZESiIsIkFtb3VudCI6IjAuNTgiLCJJbnRlZ3JhbCI6IjAiLCJMb2dpbk1hcmsiOiJINSIsIkxvZ2luVGltZSI6IjEwLzExLzIwMjQgMToyOTo1NiBBTSIsIkxvZ2luSVBBZGRyZXNzIjoiNDkuMTU2LjEwNy4xMjgiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiNTkiLCJUb2tlblR5cGUiOiJBY2Nlc3NfVG9rZW4iLCJQaG9uZVR5cGUiOiIwIiwiVXNlclR5cGUiOiIwIiwiVXNlck5hbWUyIjoiIiwiaXNzIjoiand0SXNzdWVyIiwiYXVkIjoibG90dGVyeVRpY2tldCJ9.lrdxyumfgNpaZVZLmOFqhyzCJrSCLHthKS1BtV8j0GY",
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
