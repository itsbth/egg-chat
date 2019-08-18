import React from "react";
import ReactDOM from "react-dom";
import { init } from "./init";

ReactDOM.render(
  React.createElement("h1", undefined, "Hello, World"),
  document.querySelector("#app")
);

init().then(async sock => {
  console.log("after init");
  sock({
    "Content-Type": "text/plain",
    data: "hello world"
  });
  for await (const msg of sock) {
    console.log(msg);
  }
});
