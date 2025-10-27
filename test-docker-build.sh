#!/bin/bash

echo "Testing Docker build..."

# Check if user is in docker group
if groups $USER | grep -q '\bdocker\b'; then
    echo "User is in docker group, proceeding with build..."
    docker build -t ielts-mock-test .
else
    echo "User is not in docker group. Trying with sudo..."
    echo "If this fails, you can add yourself to the docker group:"
    echo "sudo usermod -aG docker $USER"
    echo "Then log out and log back in, or run: newgrp docker"
    echo ""
    sudo docker build -t ielts-mock-test .
fi
