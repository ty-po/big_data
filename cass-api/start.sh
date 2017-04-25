#!/bin/bash
docker build -t cass-api .
docker rm cass-api
docker run -it --name cass-api --link cass:cassandra -p 8080:8080 $1 cass-api
