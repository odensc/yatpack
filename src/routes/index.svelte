<script>
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { connected, stream, send } from "../store";

	let noSleep;

	let newBitrate = 0;

	onMount(async () => {
		const { default: NoSleep } = await import("nosleep.js");
		noSleep = new NoSleep();
	});

	const toggleStream = () => {
		const { state } = get(stream);
		if (state === "off") {
			send({ type: "startStream" });
			noSleep.enable();
		} else if (state === "on") {
			if (!confirm("Are you sure?")) return;

			send({ type: "stopStream" });
			noSleep.disable();
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
	}

	.stats p {
		display: flex;
		flex-direction: column;
		margin-bottom: 0.5rem;
	}

	.stats__name {
		font-size: 1.2rem;
		font-weight: bold;
		margin-bottom: 0.2rem;
	}

	.stats__value {
		font-family: monospace;
	}

	.stats__bitrate input {
		margin: 0.25rem 0;
	}

	.stats__state {
		color: #c52027;
		font-size: 1.75rem;
		font-weight: bold;
	}

	.stats__state.on {
		color: #63f542;
	}

	.toggle-stream {
		margin-top: auto;
	}

	.toggle-stream.on {
		background: #c52027;
		color: #fff;
		font-weight: bold;
	}

	.connecting-overlay {
		align-items: center;
		backdrop-filter: blur(4px);
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		font-size: 2rem;
		font-weight: bold;
		height: 100vh;
		justify-content: center;
		position: absolute;
		width: 100vw;
	}

	.connecting-overlay.connected {
		display: none;
	}
</style>

<svelte:head>
	<title>YATpack</title>
</svelte:head>

<div class="connecting-overlay" class:connected={$connected}>
	Connecting to pack...
</div>

<div class="left-panel">
	<div class="stats">
		<p class="stats__state" class:on={$stream.state === "on"}>State: {$stream.state}</p>
		<p>
			<span class="stats__name">Packets lost:</span>
			<span class="stats__value">
				{$stream.stats["packets-sent-lost"]}/{$stream.stats["packets-sent"]}
				<br />
				({(($stream.stats["packets-sent-lost"] / ($stream.stats["packets-sent"] || 1)) * 100).toFixed(1)}%, last 10s: {$stream.stats.rollingPacketLoss.toFixed(0)}%)
			</span>
		</p>
		<p>
			<span class="stats__name">RTT:</span>
			<span class="stats__value">{$stream.stats["rtt-ms"].toFixed(1)}ms</span>
		</p>
		<p>
			<span class="stats__name">Bandwidth:</span>
			<span class="stats__value">{$stream.stats["bandwidth-mbps"].toFixed(1)}Mbps</span>
		</p>
		<p>
			<span class="stats__name">Data usage:</span>
			<span class="stats__value">{($stream.stats["bytes-sent"] / 1000 / 1000 / 1000).toFixed(1)}GB</span>
		</p>
		<p class="stats__bitrate">
			<span class="stats__name">Bitrate:</span>
			<span class="stats__value">{newBitrate || $stream.bitrate}Mbps</span>
			<input type="range" value={newBitrate || $stream.bitrate} on:input={onBitrateInput} on:change={updateBitrate} min=0.5 max=8 step={0.5}>
		</p>
	</div>

	<button class="button toggle-stream" on:click={toggleStream} class:on={$stream.state === "on"}>{$stream.state === "on" ? "Stop stream" : "Start stream"}</button>
</div>
