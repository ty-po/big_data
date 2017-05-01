#!/bin/bash
docker build -t data_api .
docker rm data_api
docker run -it --name data_api -p 4040:4040 --link rabbit-pq:rabbit data_api
