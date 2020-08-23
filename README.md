# YATpack

Code and resources for IRL streaming with the [NVIDIA Jetson Nano](https://developer.nvidia.com/embedded/jetson-nano-developer-kit).

## Random tech details

-   HEVC video encode + Opus audio
    -   HEVC: [Slow preset](https://docs.nvidia.com/jetson/l4t/index.html#page/Tegra%2520Linux%2520Driver%2520Package%2520Development%2520Guide%2Faccelerated_gstreamer.html%23wwpID0E0CU0HA), Two-pass CBR, Intra Refresh, Bitrate customizable via UI
    -   Opus: voice profile, 64k
    -   [Full GStreamer pipeline](https://github.com/odensc/yatpack/blob/master/src/server/pipeline.js)
-   MPEG-TS container over [SRT](https://www.srtalliance.org/)
    -   Default 300ms latency (modify pipeline.js to configure)
-   Dockerized server component
    -   Runs srt-live-server with sane config
    -   Runs Node.js watchdog server that can swap between scenes on RIP using obs-websocket
-   Dockerized client component
    -   Web UI for starting/stopping stream, statistics, configuring settings
    -   PWA, so you can add it to your home screen for easy access

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

Both the client and server (technically optional) are distributed as Docker images.

#### 1. Client

The Jetson Nano image should come with Docker pre-installed, so simply run the below commands:

```bash
sudo systemctl enable --now docker
sudo docker run --restart always --name yatpack-client \
  --ipc=host --runtime nvidia \
  --device /dev/snd --device /dev/video0 -p 3000:3000 \
  -e SRT_IP=box.odensc.me:1935 \
  odensc/yatpack-client
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
