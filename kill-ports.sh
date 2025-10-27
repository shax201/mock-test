#!/bin/bash

echo "🔥 Killing all processes on common ports..."

# Common ports used by this application
PORTS=(3000 3001 3002 5432 6379 8080 8000)

# Function to kill process on port
kill_port() {
    local port=$1
    echo "🔍 Checking port $port..."
    
    # Find process using the port
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        echo "⚠️  Port $port is in use by PID $pid"
        echo "🛑 Killing process $pid on port $port..."
        kill -9 $pid 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ Successfully killed process on port $port"
        else
            echo "❌ Failed to kill process on port $port (may need sudo)"
            echo "   Try: sudo fuser -k $port/tcp"
        fi
    else
        echo "✅ Port $port is free"
    fi
    echo ""
}

# Kill processes on each port
for port in "${PORTS[@]}"; do
    kill_port $port
done

echo "🧹 Cleaning up Docker containers..."

# Check if user is in docker group
if groups $USER | grep -q '\bdocker\b'; then
    DOCKER_CMD="docker"
else
    DOCKER_CMD="sudo docker"
fi

echo "🛑 Stopping all Docker containers..."
$DOCKER_CMD stop $($DOCKER_CMD ps -q) 2>/dev/null || echo "No containers to stop"

echo "🗑️  Removing all Docker containers..."
$DOCKER_CMD rm $($DOCKER_CMD ps -aq) 2>/dev/null || echo "No containers to remove"

echo "🧹 Cleaning up Docker images..."
$DOCKER_CMD image prune -f

echo ""
echo "✅ All ports cleared and Docker cleaned up!"
echo "🚀 You can now run: ./start-app.sh"
