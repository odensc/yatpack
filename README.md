# YATpack

Code and resources for IRL streaming with the [NVIDIA Jetson Nano](https://developer.nvidia.com/embedded/jetson-nano-developer-kit).

## Random tech details

-   HEVC video encode + Opus audio
    -   720p60 by default
    -   Sent over network via [SRT](https://www.srtalliance.org/)
    -   [Full GStreamer pipeline](https://github.com/odensc/yatpack/blob/master/src/server/pipeline.js)
-   Dockerized Jetson client component:
    -   Web UI for starting/stopping stream, statistics, configuring settings
    -   PWA, so you can add it to your home screen for easy access
-   Dockerized server component:
    -   Runs srt-live-server with sane config
    -   Runs Node.js watchdog server that can swap between scenes on low bitrate using obs-websocket

## Setup

![](https://i.imgur.com/dyWucrS.jpg)

### Hardware

You'll want:

-   a Jetson Nano 2GB developer kit
-   a UVC capture card compatible with Linux/V4L2, capable of at least 1080p30 uncompressed @ YUV 4:2:2
    -   I'm currently using a Cam Link 4K, but other cards should work if you can change the GStreamer pipeline accordingly.
-   a camera! With HDMI output for the capture card.
-   a high quality USB-C power bank that supports 5v @ 3A
    -   I'm currently using [this one](https://smile.amazon.com/gp/product/B082PGS78L). You should look at the spec sheet / manual to confirm max current.
-   USB-C cable
-   USB WiFi adapter, or cable for phone to USB tether
-   MicroSD card with Jetson image flashed, at least 32GB

### Software

Both the client and server are distributed as Docker images. The client runs on your Nano, and the server runs on your PC/VPS.

#### 1. Client

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

Edit the above environment variables accordingly to match your OBS setup (below).

#### 3. OBS Machine

You should install [obs-websocket](https://github.com/Palakis/obs-websocket) and configure it to require a password.

Make a new scene called `Connected` and create a Media Source. This scene will show whilst the stream is on.

![](https://i.imgur.com/Dqibk2x.png)

![](https://i.imgur.com/nQoA1nU.png)

For the input URL, use `srt://my.server.com:1935?streamid=output/live/pack` (replacing the IP), set Network Buffering to the minimum value, and enable hardware decoding.

Make a new scene called `Disconnected` and put whatever graphics you want in it. This scene will show when the bitrate is too low for coherent video, or when the stream completely drops.

Stream!
