#!/bin/bash
docker build -t testr .
docker rm testr
docker run -it --name testr -p 2020:2020 --link influx:8086 testr
