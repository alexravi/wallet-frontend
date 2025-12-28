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
npm install --production=false

# Ensure node_modules/.bin is in PATH after install
export PATH="$PWD/node_modules/.bin:$PATH"

# Build the application using npx to ensure binaries are found
echo "Building application..."
npx tsc && npx vite build

# Verify build was successful
if [ ! -d "dist" ]; then
    echo "ERROR: Build failed - dist directory not found"
    exit 1
fi

# Start the application using npx
echo "Starting application on port $PORT..."
npx vite preview --host 0.0.0.0 --port "$PORT"

