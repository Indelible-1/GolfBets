#!/bin/bash
set -e

echo "GolfSettled Development Setup"
echo "================================="

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "Node.js 20+ required. Current: $(node -v)"
  exit 1
fi
echo "Node.js version: $(node -v)"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Copy environment file
if [ ! -f .env.local ]; then
  if [ -f .env.example ]; then
    echo "Creating .env.local from template..."
    cp .env.example .env.local
    echo "Please edit .env.local with your Firebase credentials"
  else
    echo "Warning: .env.example not found. Create .env.local manually."
  fi
else
  echo ".env.local already exists"
fi

# Install Firebase CLI if not present
if ! command -v firebase &> /dev/null; then
  echo "Installing Firebase CLI..."
  npm install -g firebase-tools
fi

# Login to Firebase (if not already)
echo "Checking Firebase authentication..."
firebase login --no-localhost 2>/dev/null || echo "Firebase login skipped (run 'firebase login' manually if needed)"

# Install Husky hooks
echo "Setting up git hooks..."
npm run prepare 2>/dev/null || echo "Husky setup skipped"

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your Firebase credentials"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Run 'npm run emulators' to start Firebase emulators"
echo ""
