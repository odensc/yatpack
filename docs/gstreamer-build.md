# Compile GStreamer w/ SRT support

**TODO untested**

Build and install SRT first

```bash
git clone https://github.com/GStreamer/gst-build
cd gst-build

meson --prefix=$HOME/gst \
 -Dbad=enabled -Dgst-plugins-bad:openh264=disabled -Dgst-plugins-bad:srt=enabled -Dgst-plugins-base:opus=enabled \
 -Drtsp_server=disabled -Dlibav=disabled \
 -Dlibnice=disabled -Dgst-examples=disabled -Dpython=disabled \
 -Ddoc=disabled -Dexamples=disabled -Dtests=disabled -Dvaapi=disabled \
 builddir
ninja -C builddir
meson install -C builddir

# copy nvidia plugins to custom build
cp /usr/lib/aarch64-linux-gnu/gstreamer-1.0/libgstnv* /usr/lib/aarch64-linux-gnu/gstreamer-1.0/libgstomx.so \
 ~/gst/lib/aarch64-linux-gnu/gstreamer-1.0
```
