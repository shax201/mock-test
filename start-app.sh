#!/bin/bash

echo "🚀 Starting IELTS Mock Test Application..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to find free port
find_free_port() {
    local start_port=$1
    local port=$start_port
    while check_port $port; do
        port=$((port + 1))
    done
    echo $port
}

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

# Check if port 3000 is available
if check_port 3000; then
    echo "⚠️  Port 3000 is already in use"
    FREE_PORT=$(find_free_port 3001)
    echo "🔄 Using port $FREE_PORT instead"
    APP_PORT=$FREE_PORT
else
    echo "✅ Port 3000 is available"
    APP_PORT=3000
fi

echo "🐳 Starting Docker container on port $APP_PORT..."
echo "🌐 Application will be available at: http://localhost:$APP_PORT"
echo ""

# Run the container
$DOCKER_CMD run -p $APP_PORT:3000 ielts-mock-test
