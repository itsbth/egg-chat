// wip, not quite working yet
type EventListenerType<T extends EventTarget, E extends string> = Parameters<
  T["addEventListener"]
>[0] extends E
  ? Parameters<T["addEventListener"]>[1]
  : never;
const waitForEvent = <T = unknown>(el: EventTarget, ev: string) => {
  return new Promise<T>(res => {
    const ll = evt => {
      el.removeEventListener(ev, ll);
      res(evt);
    };
    el.addEventListener(ev, ll);
  });
};

interface Socket extends AsyncIterable<MessageEvent> {
  (obj: {}): void;
}

export const init = async () => {
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
    token = res.token as string;
    localStorage.setItem("token", token);
  }
  const url = `${window.location.protocol === "https:" ? "wss" : "ws"}://${
    window.location.host
  }/chat`;
  const ws = new WebSocket(url);
  await waitForEvent(ws, "open");
  ws.send(
    JSON.stringify({
      type: "auth",
      token
    })
  );
  const ss = await waitForEvent<MessageEvent>(ws, "message");
  if (JSON.parse(ss.data).status !== "auth-ok") {
    throw new Error("NOT OK");
  }
  const send = ((message: {}) => {
    ws.send(JSON.stringify(message));
  }) as Socket;
  send[Symbol.asyncIterator] = async function*() {
    while (ws.readyState === WebSocket.OPEN) {
      const message = await waitForEvent<MessageEvent>(ws, "message");
      yield message.data;
    }
  };
  return send;
};
