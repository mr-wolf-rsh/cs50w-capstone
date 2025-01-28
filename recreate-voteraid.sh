#!/bin/sh

docker compose down --rmi all --volumes
docker compose build --no-cache --quiet
docker compose up --detach
docker volume prune -f
docker image prune -a -f