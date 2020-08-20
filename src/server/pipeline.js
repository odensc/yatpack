import gstreamer from "gstreamer-superficial";
import { stream } from "./state";

export const pipeline = new gstreamer.Pipeline(`videotestsrc ! fakesink`);

// export const pipeline = new gstreamer.Pipeline(`
// v4l2src device=/dev/video0 ! video/x-raw, width=1920, height=1080, framerate=30/1, format=YUY2 ! queue ! nvvidconv ! video/x-raw(memory:NVMM), format=NV12 ! \
//   nvv4l2h265enc name=enc maxperf-enable=1 bitrate=${Math.floor(
// 		stream.bitrate * 1000 * 1000
//   )} control-rate=1 qp-range=35,51:35,51:-1,-1 preset-level=4 profile=0 insert-sps-pps=1 SliceIntraRefreshEnable=true SliceIntraRefreshInterval=30 EnableTwopassCBR=1 ! video/x-h265, stream-format=byte-stream ! queue ! mux. \
//   alsasrc device=hw:2 ! queue ! opusenc audio-type=voice ! queue ! mux. \
//   mpegtsmux alignment=7 name=mux ! srtsink name=srt uri="srt://${
// 		process.env.SRT_IP
//   }:1935?streamid=input/live/cam" latency=300 sync=true
// `);
