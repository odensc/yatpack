const express = require("express");
const bodyParser = require("body-parser");
const obs = require("./obs");

const app = express();
app.use(bodyParser.json());

app.post("/sls/event", (req, res) => {
	/*
		{
			on_event: 'on_connect',
			role_name: 'publisher',
			srt_url: 'input/live/pack',
			remote_ip: '172.17.0.1',
			remote_port: '57374'
		}
	*/
	const { query } = req;
	// Don't need to handle this right now...

	res.sendStatus(200);
});

app.post("/sls/stats", (req, res) => {
	/* [
		{
			port: '1935',
			role: 'publisher',
			pub_domain_app: 'input/live',
			stream_name: 'pack',
			url: 'input/live/pack',
			remote_ip: '172.17.0.1',
			remote_port: '58927',
			start_time: '2020-08-22 00:15:12',
			kbitrate: '4274'
		},
		...
	] */

	if (!obs._connected) return res.sendStatus(200);

	const stats = req.body.find((stream) => stream.url === "input/live/pack");
	if (stats) {
		if (stats.kbitrate < 200) {
			obs.send("SetCurrentScene", { "scene-name": "Disconnected" });
			console.log(
				"[obs] Scene: Disconnected, reason: bitrate below 200k"
			);
		} else {
			obs.send("SetCurrentScene", { "scene-name": "Connected" });
			console.log("[obs] Scene: Connected");
		}
	} else {
		obs.send("SetCurrentScene", { "scene-name": "Disconnected" });
		console.log("[obs] Scene: Disconnected, reason: no stream");
	}

	res.sendStatus(200);
});

app.listen(3000, () => console.log("Server started"));
