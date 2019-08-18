import React from "react";
import ReactDOM from "react-dom";

ReactDOM.render(
  React.createElement("h1", undefined, "Hello, World"),
  document.querySelector("#app")
);

const init = async () => {
  let token = localStorage.getItem("token");
  if (!token) {
    const req = await fetch("/token", {
      method: "post",
      body: JSON.stringify({ nick: "itsbth" }),
      headers: { "Content-Type": "application/json" }
    });
    const res = await req.json();
    if (res.status !== "ok") {
      throw new Error();
    }
    token = res.token;
    localStorage.setItem("token", token);
  }
  const url = `${window.location.protocol === "https:" ? "wss" : "ws"}://${
    window.location.host
  }/chat`;
  const ws = new WebSocket(url);
  ws.addEventListener("open", () => {
    ws.send(
      JSON.stringify({
        type: "auth",
        token
      })
    );
  ws.send(
    JSON.stringify({
      "Content-Type": "text/plain",
      data: "hello world"
    })
  );
  });
  ws.addEventListener("message", ev => {
    console.log(ev.data);
  });
};

init().then(console.log, console.error);
