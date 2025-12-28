#!/bin/sh

# Enter the source directory
cd "/home/site/wwwroot"

# Build the application
echo "Building application..."
npm run build

# Start the application
echo "Starting application..."
npm start

