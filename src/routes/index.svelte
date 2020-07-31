<script>
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { stream, send } from "../store";

	let newBitrate = 0;
	let rollingPacketLoss = "0.0";

	onMount(() => {
		let currentPacketsSent = 0;
		let currentPacketsLost = 0;
		let lastPacketsSent = 0;
		let lastPacketsLost = 0;

		stream.subscribe(value => {
			currentPacketsSent = value.stats["packets-sent"];
			currentPacketsLost = value.stats["packets-sent-lost"];
		});

		setInterval(() => {
			const packetsLostDelta = currentPacketsLost - lastPacketsLost;
			const packetsSentDelta = currentPacketsSent - lastPacketsSent;

			rollingPacketLoss = (
				packetsLostDelta /
				(packetsSentDelta || 1) *
				100
			).toFixed(1);

			lastPacketsSent = currentPacketsSent;
			lastPacketsLost = currentPacketsLost;
		}, 10000);
	});

	const toggleStream = () => {
		const { state } = get(stream);
		if (state === "off") {
			send({ type: "startStream" });
		} else if (state === "on") {
			if (confirm("Are you sure?")) send({ type: "stopStream" });
		}
	};

	const onBitrateInput = e => (newBitrate = e.target.valueAsNumber);

	const updateBitrate = () => {
		send({ type: "setBitrate", data: { bitrate: newBitrate } });
		newBitrate = 0;
	};
</script>

<style lang="scss">
	.left-panel {
		display: flex;
		flex-basis: 25%;
		flex-direction: column;
		margin: 1rem;
	}

	.stats {
		display: flex;
		flex-direction: column;
		font-family: monospace;
	}

	.stats p {
		display: flex;
		flex-direction: column;
		margin-bottom: 0.5rem;
	}

	.stats__name {
		font-weight: bold;
	}

	.stats__bitrate input {
		margin: 0.25rem 0;
	}

	.stats__state {
		color: #c52027;
		font-size: 1.5rem;
		font-weight: bold;
	}

	.stats__state.on {
		color: #63f542;
	}

	.toggle-stream {
		font-family: monospace;
		margin-top: auto;
	}

	.toggle-stream.on {
		background: #c52027;
		color: #fff;
		font-weight: bold;
	}
</style>

<svelte:head>
	<title>YATpack</title>
</svelte:head>

<div class="left-panel">
	<div class="stats">
		<p class="stats__state" class:on={$stream.state === "on"}>State: {$stream.state}</p>
		<p>
			<span class="stats__name">Packets lost:</span>
			<span class="stats__value">
				{$stream.stats["packets-sent-lost"]}/{$stream.stats["packets-sent"]}
				<br />
				({(($stream.stats["packets-sent-lost"] / ($stream.stats["packets-sent"] || 1)) * 100).toFixed(1)}%, last 10s: {rollingPacketLoss}%)
			</span>
		</p>
		<p>
			<span class="stats__name">RTT:</span>
			<span class="stats__value">{$stream.stats["rtt-ms"].toFixed(1)}ms</span>
		<p>
			<span class="stats__name">Send rate:</span>
			<span class="stats__value">{$stream.stats["send-rate-mbps"].toFixed(1)}Mbps</span>
		<p>
			<span class="stats__name">Data usage:</span>
			<span class="stats__value">{($stream.stats["bytes-sent"] / 1000 / 1000 / 1000).toFixed(1)}GB</span>
		
		<p class="stats__bitrate">
			<span class="stats__name">Bitrate:</span>
			<span class="stats__value">{newBitrate || $stream.bitrate}Mbps</span>
			<input type="range" value={newBitrate || $stream.bitrate} on:input={onBitrateInput} on:change={updateBitrate} min=1 max=8>
		</p>
	</div>

	<button class="button toggle-stream" on:click={toggleStream} class:on={$stream.state === "on"}>{$stream.state === "on" ? "Stop stream" : "Start stream"}</button>
</div>

<p><strong>Try editing this file (src/routes/index.svelte) to test live reloading.</strong></p>
