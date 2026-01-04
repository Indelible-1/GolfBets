#!/bin/bash
set -e

echo "🧪 Running CI Tests..."
echo "========================="

echo ""
echo "📦 Installing dependencies..."
npm ci

echo ""
echo "🔍 Running linter..."
npm run lint

echo ""
echo "📝 Running type check..."
npm run typecheck

echo ""
echo "🧪 Running unit tests with coverage..."
npm run test:ci

echo ""
echo "🎭 Installing Playwright browsers..."
npx playwright install --with-deps chromium

echo ""
echo "🌐 Running E2E tests (chromium only for CI)..."
npm run e2e -- --project=chromium

echo ""
echo "✅ All tests passed!"
echo "========================="
