const express = require("express");
const ws = require("express-ws");
const bp = require("body-parser");
const jwt = require("jsonwebtoken");
const uuidv4 = require("uuid/v4");
const app = express();
const wsApp = ws(app);

const delay = ms => new Promise(res => setTimeout(res, ms));

app.use(bp.json());
app.use(express.static("dist/"));

const clients = new Map();

app.post("/token", (req, res) => {
  const user = {
    nick: req.body.nick || "Anonymous Coward",
    uuid: uuidv4()
  };
  res.json({
    status: "ok",
    token: jwt.sign(user, process.env.JWT_KEY)
  });
});

app.ws("/chat", (wss, req) => {
  const state = {
    nick: undefined,
    state: "init",
    user: null
  };
  clients.set(wss, state);
  wss.on("message", msg => {
    const data = JSON.parse(msg);
    if (state.state !== "ready") {
      if (!data.type === "auth") {
        wss.close();
      }
      const user = jwt.verify(data.token, process.env.JWT_KEY);
      state.user = user;
      state.state = "ready";
      wss.send(JSON.stringify({ status: "auth-ok" }));
      return;
    }
    const message = JSON.stringify({
      type: "message",
      user: state.user,
      payload: data
    });
    for (const [sock, state] of clients.entries()) {
      sock.send(message);
    }
  });
  wss.on("close");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
