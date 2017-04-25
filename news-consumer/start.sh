#!/bin/bash
docker build -t news-consumer .
docker rm news-consumer
. config
docker run -it --name news-consumer -e NEWS_AUTH -e NEWS_WORKER_ID -e NEWS_WORKERS --link cass-api:8080 news-consumer
