#!/bin/bash
docker run -it --link cass:cassandra --rm cassandra cqlsh cassandra
