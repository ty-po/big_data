#!/bin/bash
docker build -t twitter-consumer .
docker rm twitter-consumer
docker run -it --name twitter-consumer --link cass-api:8080 twitter-consumer
