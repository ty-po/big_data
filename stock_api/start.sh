#!/bin/bash
docker build -t stock_api .
docker rm stock_api
docker run -it --name stock_api -p 2020:2020 --link influx:8086 -d stock_api
