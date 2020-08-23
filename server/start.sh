#!/bin/sh
cd /app

yarn start &

sls -c /etc/sls/sls.conf