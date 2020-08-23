const { backOff } = require("exponential-backoff");
const OBSWebSocket = require("obs-websocket-js");

const connect = () => {
	console.log(`[obs] Attempting to connect to ${process.env.OBS_ADDRESS}`);
	obs.disconnect();
	return obs.connect({
		address: process.env.OBS_ADDRESS,
		password: process.env.OBS_PASSWORD,
	});
};

const tryConnect = () =>
	backOff(connect, { numOfAttempts: Infinity, maxDelay: 5000 });

const obs = new OBSWebSocket();
obs.on("AuthenticationFailure", () => console.error("[obs] Auth failure"));
obs.on("AuthenticationSuccess", () => console.log("[obs] Auth success"));
obs.on("ConnectionOpened", () => {
	console.log("[obs] Connected");
	obs.on("ConnectionClosed", () => {
		obs.removeAllListeners("ConnectionClosed");
		tryConnect();
	});
});
obs.on("error", (err) => console.error(err));

tryConnect();

module.exports = obs;
