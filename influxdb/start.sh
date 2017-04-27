#!/bin/bash
docker rm influx
docker run --name influx \
      -p 8086:8086 \
      -v $PWD/.database:/var/lib/influxdb \
      -v $PWD/influxdb.conf:/etc/influxdb/influxdb.conf:ro \
      influxdb -config /etc/influxdb/influxdb.conf
