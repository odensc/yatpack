const { backOff } = require("exponential-backoff");
const OBSWebSocket = require("obs-websocket-js");

const connect = () => {
	obs.disconnect();
	return obs.connect({
		address: process.env.OBS_ADDRESS,
		password: process.env.OBS_PASSWORD,
	});
};

const obs = new OBSWebSocket();
obs.on("AuthenticationFailure", () => console.error("Auth failure"));
obs.on("AuthenticationSuccess", () => console.log("Auth success"));
obs.on("ConnectionClosed", () =>
	backOff(connect, { numOfAttempts: Infinity, maxDelay: 5000 })
);
obs.on("ConnectionOpened", () => console.log("Connected"));
obs.on("error", (err) => console.error(err));

connect();

module.exports = obs;
