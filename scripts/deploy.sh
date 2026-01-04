#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}GolfSettled Deployment Script${NC}"
echo "=================================="

# Check for required tools
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed.${NC}" >&2; exit 1; }
command -v firebase >/dev/null 2>&1 || { echo -e "${YELLOW}firebase-tools not found. Install with: npm install -g firebase-tools${NC}"; }

# Parse arguments
DEPLOY_TARGET=${1:-"all"}  # all, vercel, firebase, functions, rules

echo -e "\n${YELLOW}Target: ${DEPLOY_TARGET}${NC}\n"

# Pre-deployment checks
echo "Running pre-deployment checks..."

echo "  -> Linting..."
npm run lint || { echo -e "${RED}Lint failed!${NC}"; exit 1; }

echo "  -> Type checking..."
npm run typecheck || { echo -e "${RED}Type check failed!${NC}"; exit 1; }

echo "  -> Building..."
npm run build || { echo -e "${RED}Build failed!${NC}"; exit 1; }

echo "  -> Running tests..."
npm run test || { echo -e "${RED}Tests failed!${NC}"; exit 1; }

echo -e "${GREEN}All checks passed!${NC}\n"

# Deploy based on target
case $DEPLOY_TARGET in
  "vercel")
    echo "Deploying to Vercel..."
    if command -v vercel &> /dev/null; then
      vercel --prod
    else
      echo -e "${YELLOW}Vercel CLI not installed. Deploy via GitHub push to main.${NC}"
    fi
    ;;

  "firebase")
    echo "Deploying Firebase (rules + functions)..."
    firebase deploy --only firestore:rules,firestore:indexes,functions
    ;;

  "functions")
    echo "Deploying Cloud Functions..."
    firebase deploy --only functions
    ;;

  "rules")
    echo "Deploying Firestore rules..."
    firebase deploy --only firestore:rules,firestore:indexes
    ;;

  "all")
    echo "Deploying Firebase..."
    if command -v firebase &> /dev/null; then
      firebase deploy --only firestore:rules,firestore:indexes,functions
    else
      echo -e "${YELLOW}Firebase CLI not installed. Skipping Firebase deployment.${NC}"
    fi

    echo "Deploying to Vercel..."
    if command -v vercel &> /dev/null; then
      vercel --prod
    else
      echo -e "${YELLOW}Vercel CLI not installed. Deploy via GitHub push.${NC}"
    fi
    ;;

  *)
    echo -e "${RED}Unknown target: ${DEPLOY_TARGET}${NC}"
    echo "Usage: ./scripts/deploy.sh [all|vercel|firebase|functions|rules]"
    exit 1
    ;;
esac

echo -e "\n${GREEN}Deployment complete!${NC}"
