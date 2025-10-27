#!/bin/bash

echo "Starting IELTS Mock Test Application..."

# Check if user is in docker group
if groups $USER | grep -q '\bdocker\b'; then
    echo "User is in docker group, starting with docker-compose..."
    docker-compose up
else
    echo "User is not in docker group. Starting with sudo..."
    echo "To fix this permanently, run:"
    echo "sudo usermod -aG docker $USER"
    echo "Then log out and log back in, or run: newgrp docker"
    echo ""
    sudo docker-compose up
fi
