#!/bin/bash

# Quick test build script

echo "🔨 Testing Docker build with fixes..."

# Test the simple Dockerfile first
echo "📦 Testing simple Dockerfile..."
if sudo docker build -f Dockerfile.simple -t ielts-test:simple .; then
    echo "✅ Simple Dockerfile build successful!"
else
    echo "❌ Simple Dockerfile build failed!"
    exit 1
fi

echo "🎉 All builds successful! You can now use:"
echo "   sudo docker run -p 3000:3000 ielts-test:simple"
