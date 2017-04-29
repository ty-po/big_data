#!/bin/bash
docker build -t frontend .
docker rm frontend
docker run --name frontend -d -p 80:80 -v /home/ec2-user/big_data/frontend/public/:/usr/share/nginx/html:ro -d frontend
