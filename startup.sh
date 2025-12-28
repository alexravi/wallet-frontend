#!/bin/sh

# Exit on any error
set -e

# Enter the source directory
cd "/home/site/wwwroot"

# Set default PORT if not provided
if [ -z "$PORT" ]; then
    export PORT=8080
fi

# Install dependencies (including devDependencies needed for build)
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Verify build was successful
if [ ! -d "dist" ]; then
    echo "ERROR: Build failed - dist directory not found"
    exit 1
fi

# Start the application
echo "Starting application on port $PORT..."
npm start

