#!/bin/bash
docker run --name cass -v /home/${USER}/database:/var/lib/cassandra -d cassandra:3
