import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";
import gstreamer from "gstreamer-superficial";
import { createServer } from "http";
import WebSocket from "ws";

const STATS_REGEX = new RegExp(/([^=]+)=\([^)]+\)(.+)/);

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";
const server = createServer();

const pipeline = new gstreamer.Pipeline(`
v4l2src device=/dev/video0 ! video/x-raw, width=1920, height=1080, framerate=30/1, format=YUY2 ! nvvidconv ! video/x-raw(memory:NVMM), format=NV12 ! \
  nvv4l2h265enc maxperf-enable=1 bitrate=5000000 control-rate=0 iframeinterval=60 preset-level=3 profile=0 insert-sps-pps=1 MeasureEncoderLatency=1 ! video/x-h265, stream-format=byte-stream ! \
  h265parse ! mpegtsmux alignment=7 name=mux ! srtserversink name=srt uri="srt://${process.env.SRT_IP}:1935?streamid=input/live/cam" latency=300  \
  alsasrc device=hw:2 ! audioconvert ! opusenc audio-type=voice ! mux.
`);

const stream = {
	state: "off",
	stats: {
		"bytes-sent": 0,
		"packets-sent": 0,
		"packets-sent-lost": 0,
		"rtt-ms": 0,
		"send-rate-mbps": 0,
	},
};

const updateStream = (obj) => {
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

pipeline.pollBus(function (msg) {
	console.log(msg);
	if (msg.type === "stream-start") {
		updateStream({ state: "on" });
	} else if (msg.type === "eos") {
		updateStream({ state: "off" });
		pipeline.stop();
	}
});

setInterval(() => {
	if (stream.state === "off") return;

	const parseStats = (str) => {
		// e.g. application/x-srt-statistics, packets-sent=(gint64)6450, ...
		const stats = {};
		str.split(", ")
			.slice(1)
			.forEach((prop) => {
				const groups = prop.match(STATS_REGEX);
				stats[groups[1]] = parseFloat(groups[2]);
			});

		return stats;
	};

	updateStream({ stats: parseStats(pipeline.findChild("srt").stats) });
}, 250);

const wss = new WebSocket.Server({ path: "/ws", server });
wss.on("connection", (ws) => {
	ws.on("message", (msgJson) => {
		const msg = JSON.parse(msgJson);
		if (msg.type === "startStream") {
			pipeline.play();
			updateStream({ state: "on" });
		} else if (msg.type === "stopStream") {
			pipeline.stop();
			updateStream({ state: "off" });
		}
	});

	ws.send(
		JSON.stringify({
			type: "stream",
			data: stream,
		})
	);
});

polka({ server })
	.use(
		compression({ threshold: 0 }),
		sirv("static", { dev }),
		sapper.middleware()
	)
	.listen(PORT, (err) => {
		if (err) console.log("error", err);
	});
