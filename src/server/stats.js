import { getRollingPacketLoss } from "./packet-loss";
import { pipeline } from "./pipeline";
import { stream } from "./state";
import { updateStream } from "./websocket";

const STATS_REGEX = new RegExp(/([^=]+)=\([^)]+\)(.+)/);
const STATS_POLL_MS = 250;

const parseStats = (str) => {
	// e.g. rist/x-sender-stats, sent-original-packets=(guint64)0, ...
	const stats = {};
	console.log(str);
	str.split(", ")
		.slice(1)
		.forEach((prop) => {
			const groups = prop.match(STATS_REGEX);
			stats[groups[1]] = groups[2];
		});

	return {
		packetsSent: stats["sent-original-packets"],
		packetsLost: stats["sent-retransmitted-packets"],
	};
};

setInterval(() => {
	if (stream.state === "off") return;

	const stats = parseStats(pipeline.findChild("rist").stats);
	updateStream({
		stats: {
			...stats,
			rollingPacketLoss: getRollingPacketLoss(stats),
		},
	});
}, STATS_POLL_MS);
