#!/bin/bash

echo "🛑 Stopping Docker container..."

# Get the container ID from docker ps
CONTAINER_ID=$(sudo docker ps -q)

if [ ! -z "$CONTAINER_ID" ]; then
    echo "Found running container: $CONTAINER_ID"
    echo "Stopping container..."
    sudo docker stop $CONTAINER_ID
    echo "Removing container..."
    sudo docker rm $CONTAINER_ID
    echo "✅ Container stopped and removed!"
else
    echo "No running containers found"
fi

echo ""
echo "🚀 Now you can run: ./start-app.sh"
