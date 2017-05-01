#!/bin/bash
docker rm worker2
docker run -it --name worker2 --link rabbit-pq:rabbit worker
