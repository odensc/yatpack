#!/bin/bash

# Copy NVIDIA GST plugins that are mounted at runtime
cp /usr/lib/aarch64-linux-gnu/gstreamer-1.0/libgstnv* /usr/lib/aarch64-linux-gnu/gstreamer-1.0/libgstomx.so \
  gst/lib/aarch64-linux-gnu/gstreamer-1.0

yarn start