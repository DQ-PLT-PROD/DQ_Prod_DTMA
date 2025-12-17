#!/bin/bash
set -e

echo "Cleaning up old containers..."
docker stop dtma 2>/dev/null || true
docker rm dtma 2>/dev/null || true

echo "Building Docker image..."
docker build -t dtma:latest .

echo "Starting container with environment variables..."
docker run -d -p 8080:3000 \
  --env-file .env.local \
  --name dtma \
  dtma:latest

echo "Waiting for container to start..."
sleep 5

echo ""
echo "Container logs:"
docker logs dtma

echo ""
echo "Checking if env-config.js was created:"
docker exec dtma cat //usr/share/nginx/html/env-config.js || echo "env-config.js not found!"

echo ""
echo "Container running at http://localhost:8080"
