# YATpack

Code and resources for IRL streaming with the [NVIDIA Jetson Nano](https://developer.nvidia.com/embedded/jetson-nano-developer-kit).

## Random tech details

-   HEVC video encode + Opus audio
    -   [Full GStreamer pipeline](https://github.com/odensc/yatpack/blob/master/src/server/pipeline.js)
    -   Sent over network via [SRT](https://www.srtalliance.org/)
-   Dockerized Jetson client component:
    -   Web UI for starting/stopping stream, statistics, configuring settings
    -   PWA, so you can add it to your home screen for easy access
-   Dockerized server component:
    -   Runs srt-live-server with sane config
    -   Runs Node.js watchdog server that can swap between scenes on low bitrate using obs-websocket

## Setup

### Hardware

![](https://i.imgur.com/08WXYOd.jpg)

_My overkill setup_

![](https://i.imgur.com/5WYdFwV.jpg)

You'll want:

-   a Jetson Nano developer kit (any revision)
-   a UVC capture card compatible with Linux/V4L2, capable of at least 1080p30 uncompressed @ YUV 4:2:2
    -   I'm currently using a Cam Link 4K, but other cards should work if you can change the GStreamer pipeline accordingly.
-   a high quality USB power bank that supports 5v @ 2.4A
    -   I'm currently using [this one](https://smile.amazon.com/gp/product/B082PGS78L). You should look at the spec sheet / manual to confirm max current.
-   USB WiFi adapter, or cable for phone to USB tether
-   Micro-USB cable (ideally as thick and short as possible to prevent voltage drop)
-   MicroSD card with Jetson image flashed, at least 32GB

### Software

Both the client and server are distributed as Docker images. The client runs on your Nano, and the server runs on your PC/VPS.

#### 1. Client

First you'll want to put your Nano into 5W mode to reduce power usage and prevent crashes while running off the power bank. Edit `/etc/nvpmodel.conf` and change `PM_CONFIG DEFAULT=` to 1.

The Jetson Nano SD card image should come with Docker pre-installed, so simply run the below commands on your Nano. (you'll want to change `SRT_IP` to your server)

```bash
sudo systemctl enable --now docker
sudo docker run --restart always --name yatpack-client \
  --ipc=host --runtime nvidia \
  --device /dev/snd --device /dev/video0 -p 80:80 -e PORT=80 \
  -e SRT_IP=my.server.com:1935 \
  odensc/yatpack-client
```

The web UI should then be accessible at the IP of your Nano.

#### 2. Server

The server component is technically optional but strongly recommended, as it provides an SRT server and auto scene swapping via `obs-websocket`.
If you don't use it, you'll need to set up your own SRT server (at least).

You'll need a Linux server with Docker installed. You can also use Windows w/ Docker Desktop but will need to run the commands via WSL2.

Run the below commands:

```bash
sudo systemctl enable --now docker
sudo docker run --restart always --name yatpack-server -p 1935:1935/udp \
  -e OBS_ADDRESS=10.0.0.2:4444 -e OBS_PASSWORD=hunter2 \
  -e SCENE_NAME_CONNECTED=Connected -e SCENE_NAME_DISCONNECTED=Disconnected \
  odensc/yatpack-server
```

You should install [obs-websocket](https://github.com/Palakis/obs-websocket) on your OBS machine and configure it to require a password, then edit the above environment variables accordingly.
