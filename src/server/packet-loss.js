export const getRollingPacketLoss = (stats) => {
	currentPacketsSent = stats.packetsSent;
	currentPacketsLost = stats.packetsLost;

	return rollingPacketLoss;
};

const PERIOD_MS = 10000;

let rollingPacketLoss = 0;
let currentPacketsSent = 0;
let currentPacketsLost = 0;
let lastPacketsSent = 0;
let lastPacketsLost = 0;

setInterval(() => {
	const packetsLostDelta = currentPacketsLost - lastPacketsLost;
	const packetsSentDelta = currentPacketsSent - lastPacketsSent;

	rollingPacketLoss = (packetsLostDelta / (packetsSentDelta || 1)) * 100;

	lastPacketsSent = currentPacketsSent;
	lastPacketsLost = currentPacketsLost;
}, PERIOD_MS);
