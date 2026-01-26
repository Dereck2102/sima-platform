#!/bin/bash

echo "🔍 SIMA Platform - System Health Check"
echo "======================================="
echo ""

# Check Database
echo "📦 Database Status:"
pg_isready -h localhost -p 5432 -U sima_user > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ PostgreSQL: Running"
else
  echo "❌ PostgreSQL: Not running"
fi

# Check Kafka
echo ""
echo "📨 Kafka Status:"
docker exec sima-kafka-dev kafka-topics --list --bootstrap-server localhost:9092 > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Kafka Broker: Running"
  echo "📋 Available Topics:"
  docker exec sima-kafka-dev kafka-topics --list --bootstrap-server localhost:9092 | sed 's/^/   - /'
else
  echo "❌ Kafka Broker: Not running"
fi

# Check Zookeeper
echo ""
echo "🔐 Zookeeper Status:"
docker exec sima-zookeeper-dev echo ruok | nc localhost 2181 > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Zookeeper: Running"
else
  echo "❌ Zookeeper: Not running"
fi

# Check Redis
echo ""
echo "💾 Redis Status:"
docker exec sima-redis-dev redis-cli ping > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Redis: Running"
else
  echo "❌ Redis: Not running"
fi

# Check MongoDB
echo ""
echo "🍃 MongoDB Status:"
docker exec sima-mongodb-dev mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ MongoDB: Running"
else
  echo "❌ MongoDB: Not running"
fi

# Check RabbitMQ
echo ""
echo "🐰 RabbitMQ Status:"
docker exec sima-rabbitmq-dev rabbitmqctl status > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ RabbitMQ: Running"
else
  echo "❌ RabbitMQ: Not running"
fi

echo ""
echo "======================================="
echo "✅ Health check complete!"
