# Adapted from https://github.com/ravenium/srt-live-server

FROM node:14-alpine as build
RUN apk add --update --no-cache linux-headers alpine-sdk cmake tcl openssl-dev zlib-dev

WORKDIR /tmp

# Build SRT
RUN git clone https://github.com/Haivision/srt
RUN cd /tmp/srt && \
	./configure && \
	make -j$(nproc) && \
	make install

# Build srt-live-server
RUN git clone https://github.com/odensc/srt-live-server # 8db6601
RUN cd /tmp/srt-live-server && \
	make -j$(nproc)

FROM node:14-alpine
ENV LD_LIBRARY_PATH /lib:/usr/lib:/usr/local/lib64
RUN apk add --update --no-cache openssl libstdc++

COPY package.json /app/
COPY yarn.lock /app/
WORKDIR /app
RUN yarn --frozen-lockfile --production

COPY src/ /app/
COPY start.sh /app/

COPY --from=build /usr/local/bin/srt-* /usr/local/bin/
COPY --from=build /usr/local/lib64/libsrt* /usr/local/lib64/
COPY --from=build /tmp/srt-live-server/bin/* /usr/local/bin/
COPY sls.conf /etc/sls/

EXPOSE 1935/udp
ENTRYPOINT /app/start.sh