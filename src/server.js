import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";
import { createServer } from "http";
import WebSocket from "ws";

import "./server/stats";
import { initWebsocket } from "./server/websocket";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";
const server = createServer();

const wss = new WebSocket.Server({ path: "/ws", server });
initWebsocket(wss);

polka({ server })
	.use(
		compression({ threshold: 0 }),
		sirv("static", { dev }),
		sapper.middleware()
	)
	.listen(PORT, (err) => {
		if (err) console.log("error", err);
	});
