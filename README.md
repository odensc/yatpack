# YATpack

Code and resources for IRL streaming with the [NVIDIA Jetson Nano](https://developer.nvidia.com/embedded/jetson-nano-developer-kit).

## Random tech details

-   HEVC video encode + Opus audio
    -   HEVC: [Slow preset](https://docs.nvidia.com/jetson/l4t/index.html#page/Tegra%2520Linux%2520Driver%2520Package%2520Development%2520Guide%2Faccelerated_gstreamer.html%23wwpID0E0CU0HA), Two-pass CBR, Intra Refresh, Bitrate customizable via UI
    -   Opus: voice profile, 64k
    -   [Full GStreamer pipeline](https://github.com/odensc/yatpack/blob/master/src/server/pipeline.js)
-   MPEG-TS container over [SRT](https://www.srtalliance.org/)
    -   Default 300ms latency (modify pipeline.js to configure)
-   Pre-configured Docker container
    -   Runs srt-live-server with sane config
    -   Runs Node.js watchdog server that can swap between scenes on RIP using obs-websocket
-   Web UI for starting/stopping stream, statistics, configuring bitrate
    -   Svelte PWA

## Setup

### Hardware

![](https://i.imgur.com/08WXYOd.jpg)

_My overkill setup_

You'll want:

-   a Jetson Nano developer kit (any revision);
    -   Be sure to look around, I got one in an eBay auction for ~\$80.
-   a UVC capture card compatible with Linux/V4L2, capable of 1080p30 uncompressed @ YUV 4:2:2
    -   I'm currently using [this one](https://smile.amazon.com/gp/product/B0869LCMCG/) - [more info](https://twitter.com/marcan42/status/1281266315831808001)
    -   [MJPEG cards](https://smile.amazon.com/gp/product/B088CWQGN5) may work but lower quality and untested - will need to change GStreamer pipeline to use nvjpegdec
-   a high quality USB power bank that supports 5v @ at least 3A
    -   I'm currently using [this one](https://smile.amazon.com/gp/product/B082PGS78L). You should look at the spec sheet / manual to confirm max current. Some will additionally claim 3A but then crap out after a bit and you'll never know why it's crashing. (from experience)
-   USB WiFi adapter, or cable for phone to USB tether
-   Micro-USB cable (ideally as thick and short as possible to prevent voltage drop)
-   MicroSD card with Jetson image flashed, at least 32GB

### Software

**WIP WIP WIP**

#### 1. Install GStreamer dependencies and download pre-built GStreamer binaries

```bash
sudo add-apt-repository universe
sudo add-apt-repository multiverse
sudo apt-get update
sudo apt-get install gstreamer1.0-tools gstreamer1.0-alsa \
  gstreamer1.0-plugins-base gstreamer1.0-plugins-good \
  gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly \
  gstreamer1.0-libav
sudo apt-get install libgstreamer1.0-dev \
  libgstreamer-plugins-base1.0-dev \
  libgstreamer-plugins-good1.0-dev \
  libgstreamer-plugins-bad1.0-dev

cd ~
curl -OL https://github.com/odensc/yatpack/releases/download/0.0.1/gst.tar.gz
tar xvzf gst.tar.gz
cp /usr/lib/aarch64-linux-gnu/gstreamer-1.0/libgstnv* /usr/lib/aarch64-linux-gnu/gstreamer-1.0/libgstomx.so \
  gst/lib/aarch64-linux-gnu/gstreamer-1.0
```

#### 2. Set up Svelte server

**TODO install node.js, yarn, build dependencies, etc...**

```bash
git clone https://github.com/odensc/yatpack
cd yatpack
yarn

# set correct environment variable for SRT server
nano env.sh

yarn build
yarn start
```

#### 3.
