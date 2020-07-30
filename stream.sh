export LD_LIBRARY_PATH=/usr/local/lib:/home/oden/gst-1.17.2/lib/aarch64-linux-gnu
export PATH=/home/oden/gst-1.17.2/bin:$PATH

SRT_IP=$(dig +short box.odensc.me)

gst-launch-1.0 v4l2src device=/dev/video0 ! 'video/x-raw, width=1920, height=1080, framerate=30/1, format=YUY2' ! nvvidconv ! 'video/x-raw(memory:NVMM), format=NV12' ! \
  nvv4l2h265enc maxperf-enable=1 bitrate=4000000 control-rate=0 iframeinterval=15 preset-level=2 profile=0 insert-sps-pps=1 ! 'video/x-h265, stream-format=byte-stream' ! \
  h265parse ! mpegtsmux alignment=7 name=mux ! srtserversink uri="srt://$SRT_IP:1935?streamid=input/live/cam" latency=300  \
  alsasrc device=hw:2 ! audioconvert ! opusenc audio-type=voice ! mux.
