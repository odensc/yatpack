<script>
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { stream, send } from "../store";

	const toggleStream = () => {
		const { state } = get(stream);
		if (state === "off") send({ type: "startStream" });
		else if (state === "on") send({ type: "stopStream" });
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
		margin-bottom: 0.5rem;
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
		align-self: flex-start;
		background: #63f542;
		border: 0;
		border-radius: 0.25rem;
		display: flex;
		font-family: inherit;
		font-size: inherit;
		margin-top: auto;
		padding: 0.5rem;
	}

	.toggle-stream.on {
		background: #c52027;
		color: #fff;
	}
</style>

<svelte:head>
	<title>YATpack</title>
</svelte:head>

<div class="left-panel">
	<div class="stats">
		<p class="stats__state" class:on={$stream.state === "on"}>State: {$stream.state}</p>
		<p><strong>Packets lost:</strong> <br /> {$stream.stats["packets-sent-lost"]}/{$stream.stats["packets-sent"]} ({(($stream.stats["packets-sent-lost"] / $stream.stats["packets-sent"] || 1) * 100).toFixed(1)}%)</p>
		<p><strong>RTT:</strong> <br /> {$stream.stats["rtt-ms"].toFixed(1)}ms</p>
		<p><strong>Send rate:</strong> <br /> {$stream.stats["send-rate-mbps"].toFixed(1)}Mbps</p>
		<p><strong>Data usage:</strong> <br /> {($stream.stats["bytes-sent"] / 1000 / 1000 / 1000).toFixed(1)}GB</p>
	</div>

	<button class="toggle-stream" on:click={toggleStream} class:on={$stream.state === "on"}>{$stream.state === "on" ? "Stop stream" : "Start stream"}</button>
</div>

<p><strong>Try editing this file (src/routes/index.svelte) to test live reloading.</strong></p>
