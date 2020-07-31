import { pipeline } from "./pipeline";
import { stream } from "./state";

let wss;

const onMessage = (msgJson) => {
	const msg = JSON.parse(msgJson);
	if (msg.type === "setBitrate") {
		pipeline.findChild("enc").bitrate = msg.data.bitrate * 1000 * 1000;
		updateStream({ bitrate: msg.data.bitrate });
	} else if (msg.type === "startStream") {
		pipeline.play();
		updateStream({ state: "on" });
	} else if (msg.type === "stopStream") {
		pipeline.stop();
		updateStream({ state: "off" });
	}
};

const onPipelineMessage = (msg) => {
	if (msg.type === "stream-start") {
		updateStream({ state: "on" });
	} else if (msg.type === "eos") {
		pipeline.stop();
		updateStream({ state: "off" });
	}
};

export const initWebsocket = (_wss) => {
	wss = _wss;
	wss.on("connection", (ws) => {
		ws.on("message", onMessage);

		// Send initial state
		ws.send(
			JSON.stringify({
				type: "stream",
				data: stream,
			})
		);
	});
};

export const updateStream = (obj) => {
	Object.assign(stream, obj);
	wss.clients.forEach((client) =>
		client.send(
			JSON.stringify({
				type: "stream",
				data: stream,
			})
		)
	);
};

pipeline.pollBus(onPipelineMessage);
