#!/bin/bash
docker build -t frontend .
docker rm frontend
docker run --name frontend -d -p 80:80 frontend
