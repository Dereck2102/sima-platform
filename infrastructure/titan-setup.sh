#!/bin/bash
set -e

apt update -y
apt install -y docker.io docker-compose

systemctl enable docker
systemctl start docker

mkdir -p /opt/sima
cd /opt/sima

cat > docker-compose.yml <<EOF
version: '3'

services:

  kafka:
    image: bitnami/kafka
    environment:
      - KAFKA_CFG_NODE_ID=1
      - KAFKA_CFG_PROCESS_ROLES=broker,controller
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@kafka:9093
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_HEAP_OPTS=-Xmx1G -Xms1G
    ports:
      - "9092:9092"

  rabbit:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"

  mosquitto:
    image: eclipse-mosquitto:2.0
    ports:
      - "1883:1883"

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"

  redis:
    image: redis:7

EOF

docker compose up -d
