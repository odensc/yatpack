# Compile GStreamer w/ SRT support

**TODO untested**

```bash
sudo apt-get install tclsh pkg-config cmake libssl-dev build-essential python3 python3-pip python3-setuptools python3-wheel ninja-build libcairo2-dev
pip3 install --user meson

git clone https://github.com/Haivision/srt
cd srt
git checkout v1.4.2
./configure
make -j4
sudo make install

git clone https://github.com/GStreamer/gst-build
cd gst-build

~/.local/bin/meson --prefix=$HOME/gst \
 -Dbad=enabled -Dgst-plugins-bad:openh264=disabled -Dgst-plugins-bad:srt=enabled -Dgst-plugins-base:opus=enabled \
 -Drtsp_server=disabled -Dlibav=disabled \
 -Dlibnice=disabled -Dgst-examples=disabled -Dpython=disabled \
 -Ddoc=disabled -Dexamples=disabled -Dtests=disabled -Dvaapi=disabled \
 builddir
ninja -C builddir
~/.local/bin/meson install -C builddir

# copy srt lib to custom build
cp /usr/local/lib/libsrt.so.1 ~/gst/lib/aarch64-linux-gnu/

# remove broken and unnecessary plugins
rm ~/gst/lib/aarch64-linux-gnu/gstreamer-1.0/libgstcompositor.so ~/gst/lib/aarch64-linux-gnu/gstreamer-1.0/validate/libgstvalidatessim.so ~/gst/lib/aarch64-linux-gnu/gstreamer-1.0/libgstiqa.so ~/gst/lib/aarch64-linux-gnu/gstreamer-1.0/libgstopengl.so

cd ~
tar cvzf gst.tar.gz gst/
```
