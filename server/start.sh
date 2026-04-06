#!/bin/bash

# FraudShield SaaS Backend Startup Script

echo "🚀 Starting FraudShield Backend Server..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Creating from .env.example..."
  cp .env.example .env
  echo "📝 Please update .env with your configuration values"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run the development server
echo "🔧 Starting development server..."
npm run dev
