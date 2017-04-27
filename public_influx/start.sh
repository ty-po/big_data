#!/bin/bash
docker build -t public_influx .
docker rm public_influx
docker run -it --name public_influx -p 2020:2020 --link influx:8086 public_influx
