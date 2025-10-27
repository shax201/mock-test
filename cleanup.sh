#!/bin/bash

echo "🧹 Cleaning up Docker containers and freeing ports..."

# Check if user is in docker group
if groups $USER | grep -q '\bdocker\b'; then
    DOCKER_CMD="docker"
else
    DOCKER_CMD="sudo docker"
fi

echo "🛑 Stopping all running containers..."
$DOCKER_CMD stop $(docker ps -q) 2>/dev/null || echo "No containers to stop"

echo "🗑️  Removing all containers..."
$DOCKER_CMD rm $(docker ps -aq) 2>/dev/null || echo "No containers to remove"

echo "🧹 Cleaning up unused images..."
$DOCKER_CMD image prune -f

echo "✅ Cleanup completed!"
echo ""
echo "Now you can run: ./start-app.sh"
