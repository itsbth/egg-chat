const express = require("express");
const app = express();

const delay = ms => new Promise(res => setTimeout(res, ms));

app.use(express.static("dist/"));

app.get("/chat", async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  res.write("\n");
  const rid = parseInt(req.headers['last-event-id'] || 0, 10)
  for (let i = rid; i < rid + 10; i++) {
    res.write(`id: ${i}\r\n`);
    // res.write(`event: message\n`);
    res.write(`data: message #${i}\r\n\r\n`);
    await delay(1000);
  }
  res.end();
});

app.listen(process.env.PORT || 3000);
