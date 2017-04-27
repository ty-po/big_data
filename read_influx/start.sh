#!/bin/bash
docker build -t testr .
docker rm testr
docker run -it --name testr --link influx:8086 testr
