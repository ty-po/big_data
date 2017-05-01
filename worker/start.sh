#!/bin/bash
docker build -t worker .
docker rm worker
docker run -it --name worker --link rabbit-pq:rabbit worker
