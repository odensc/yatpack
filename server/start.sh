#!/bin/sh
cd /app

sls -c /etc/sls/sls.conf &

yarn start