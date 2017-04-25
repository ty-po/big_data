#!/bin/bash
docker build -t api-consumer .
docker rm api-consumer
docker run -it --name api-consumer --link cass-api:8080 api-consumer
