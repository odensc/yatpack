FROM nvcr.io/nvidia/l4t-base:r32.4.3
ENV LD_LIBRARY_PATH=/usr/local/lib:/app/gst/lib/aarch64-linux-gnu
ENV PATH=/app/gst/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV GST_PLUGIN_PATH=/app/gst/lib/aarch64-linux-gnu/gstreamer-1.0

WORKDIR /app

# Install dependencies
RUN apt-get update
RUN apt-get install -y curl libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn

# Install custom GStreamer build
RUN curl -OL https://github.com/odensc/yatpack/releases/download/0.0.1/gst.tar.gz # 0.0.1
RUN tar xvzf gst.tar.gz
RUN rm gst.tar.gz

# Install app dependencies
COPY package.json /app/
COPY yarn.lock /app/
RUN yarn --frozen-lockfile

COPY . /app/
RUN yarn build

ENTRYPOINT /app/start.sh