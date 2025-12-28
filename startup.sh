#!/bin/sh

# Enter the source directory
cd "/home/site/wwwroot"

# Install dependencies (including devDependencies needed for build)
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Start the application
echo "Starting application..."
npm start

