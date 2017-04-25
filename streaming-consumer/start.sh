#!/bin/bash
docker build -t streaming-consumer .
docker rm streaming-consumer
docker run -it --name streaming-consumer --link cass-api:8080 streaming-consumer
