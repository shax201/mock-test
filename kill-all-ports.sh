#!/bin/bash

echo "💀 AGGRESSIVE PORT CLEANUP - Killing ALL processes on common ports..."

# Common ports used by this application
PORTS=(3000 3001 3002 5432 6379 8080 8000)

# Function to aggressively kill process on port
aggressive_kill_port() {
    local port=$1
    echo "🔍 Checking port $port..."
    
    # Try normal kill first
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        echo "⚠️  Port $port is in use by PID $pid"
        
        # Try normal kill
        echo "🛑 Attempting normal kill..."
        kill $pid 2>/dev/null
        sleep 1
        
        # Check if still running
        if kill -0 $pid 2>/dev/null; then
            echo "💀 Process still running, using force kill..."
            kill -9 $pid 2>/dev/null
            sleep 1
            
            # Check again
            if kill -0 $pid 2>/dev/null; then
                echo "🔥 Using sudo to force kill..."
                sudo kill -9 $pid 2>/dev/null
                sleep 1
                
                # Final check
                if kill -0 $pid 2>/dev/null; then
                    echo "❌ Could not kill PID $pid on port $port"
                else
                    echo "✅ Successfully killed process on port $port with sudo"
                fi
            else
                echo "✅ Successfully killed process on port $port with force kill"
            fi
        else
            echo "✅ Successfully killed process on port $port with normal kill"
        fi
    else
        echo "✅ Port $port is free"
    fi
    echo ""
}

# Kill processes on each port aggressively
for port in "${PORTS[@]}"; do
    aggressive_kill_port $port
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

echo "🔥 Using fuser to kill any remaining processes on ports..."
for port in "${PORTS[@]}"; do
    echo "💀 Force killing anything on port $port..."
    sudo fuser -k $port/tcp 2>/dev/null || echo "Port $port is clean"
done

echo ""
echo "✅ AGGRESSIVE CLEANUP COMPLETED!"
echo "🚀 All ports should now be free. You can run: ./start-app.sh"
