#!/bin/bash
docker build -t public_api .
docker rm public_api
docker run -it --name public_api -p 2020:2020 --link influx:8086 public_api
