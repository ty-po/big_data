#!/bin/bash
docker build -t rest-consumer .
docker rm rest-consumer
docker run -it --name rest-consumer --link cass-api:8080 rest-consumer
