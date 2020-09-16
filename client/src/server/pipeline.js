import gstreamer from "gstreamer-superficial";
import { stream } from "./state";

//export const pipeline = new gstreamer.Pipeline(`videotestsrc ! fakesink`);
export const pipeline = new gstreamer.Pipeline(`
v4l2src device=/dev/video0 ! video/x-raw, width=1920, height=1080, format=YUY2 ! nvvidconv interpolation-method=5 output-buffers=10 ! queue ! video/x-raw(memory:NVMM), width=1280, height=720, format=NV12 ! \
   nvv4l2h265enc name=enc bitrate=${Math.floor(
		stream.bitrate * 1000 * 1000
   )} control-rate=1 iframeinterval=-1 preset-level=4 profile=0 insert-sps-pps=1 maxperf-enable=1 SliceIntraRefreshInterval=60 EnableTwopassCBR=1 ! video/x-h265, stream-format=byte-stream ! queue ! mux. \
   alsasrc device=hw:2 ! opusenc audio-type=voice ! queue ! mux.
   mpegtsmux alignment=7 name=mux ! srtsink name=srt uri="srt://${
		process.env.SRT_IP
   }?streamid=input/live/pack" latency=300 sync=true
`);
