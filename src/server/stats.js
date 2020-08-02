import { getRollingPacketLoss } from "./packet-loss";
import { pipeline } from "./pipeline";
import { stream } from "./state";
import { updateStream } from "./websocket";

const STATS_REGEX = new RegExp(/([^=]+)=\([^)]+\)(.+)/);
const STATS_POLL_MS = 250;

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

setInterval(() => {
	if (stream.state === "off") return;

	const stats = parseStats(pipeline.findChild("srt").stats);
	updateStream({
		stats: {
			...stats,
			rollingPacketLoss: getRollingPacketLoss(stats),
		},
	});
}, STATS_POLL_MS);
