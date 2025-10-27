#!/bin/bash

# Docker Build Script for IELTS Mock Test

set -e

echo "🔨 Building IELTS Mock Test Docker Image..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Choose Dockerfile type
DOCKERFILE_TYPE=${1:-"simple"}

case $DOCKERFILE_TYPE in
    "simple")
        echo "📦 Using simple Dockerfile..."
        DOCKERFILE="Dockerfile.simple"
        TAG="ielts-mock-test:simple"
        ;;
    "dev")
        echo "📦 Using development Dockerfile..."
        DOCKERFILE="Dockerfile.dev"
        TAG="ielts-mock-test:dev"
        ;;
    "production")
        echo "📦 Using production Dockerfile..."
        DOCKERFILE="Dockerfile"
        TAG="ielts-mock-test:latest"
        ;;
    *)
        echo "❌ Invalid Dockerfile type. Use: simple, dev, or production"
        exit 1
        ;;
esac

echo "🔍 Building with $DOCKERFILE..."

# Build the Docker image
if sudo docker build -f $DOCKERFILE -t $TAG .; then
    echo "✅ Docker image built successfully!"
    echo "🏷️  Image tagged as: $TAG"
    echo ""
    echo "🚀 To run the container:"
    echo "   sudo docker run -p 3000:3000 $TAG"
    echo ""
    echo "🔍 To check the image:"
    echo "   sudo docker images | grep ielts-mock-test"
else
    echo "❌ Docker build failed!"
    echo "🔍 Check the error messages above for details."
    exit 1
fi
