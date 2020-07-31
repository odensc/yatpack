import { writable } from "svelte/store";
import { stream as defaultState } from "./server/state";

let ws;

export const stream = writable(defaultState);

export const send = (message) => {
	if (ws.readyState <= 1) ws.send(JSON.stringify(message));
};

if (typeof window !== "undefined") {
	ws = new WebSocket(`ws://${location.host}/ws`);
	window.ws = ws;
	ws.addEventListener("message", (e) => {
		const msg = JSON.parse(e.data);

		if (msg.type === "stream") stream.set(msg.data);
	});
}
