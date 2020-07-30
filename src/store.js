import { writable } from "svelte/store";

let ws;

export const stream = writable({
	state: "off",
	stats: {
		"bytes-sent": 0,
		"packets-sent": 0,
		"packets-sent-lost": 0,
		"rtt-ms": 0,
		"send-rate-mbps": 0,
	},
});

export const send = (message) => {
	if (ws.readyState <= 1) ws.send(JSON.stringify(message));
};

if (typeof window !== "undefined") {
	ws = new WebSocket(`ws://${location.host}/ws`);

	ws.addEventListener("message", (e) => {
		const msg = JSON.parse(e.data);

		if (msg.type === "stream") stream.set(msg.data);
	});
}
