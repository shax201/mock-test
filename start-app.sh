#!/bin/bash

echo "🚀 Starting IELTS Mock Test Application..."

# Check if user is in docker group
if groups $USER | grep -q '\bdocker\b'; then
    echo "✅ User is in docker group"
    DOCKER_CMD="docker"
else
    echo "⚠️  User is not in docker group, using sudo"
    echo "   To fix this permanently, run: sudo usermod -aG docker $USER"
    echo "   Then log out and log back in, or run: newgrp docker"
    echo ""
    DOCKER_CMD="sudo docker"
fi

echo "🐳 Starting Docker container on port 3000..."
echo "🌐 Application will be available at: http://localhost:3000"
echo ""

# Run the container
$DOCKER_CMD run -p 3000:3000 ielts-mock-test
