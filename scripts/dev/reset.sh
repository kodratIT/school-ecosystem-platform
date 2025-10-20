#!/usr/bin/env bash

# Reset project to fresh state

set -e

echo "🔄 Resetting project..."
echo ""

# Run clean
./scripts/dev/clean.sh

echo ""
echo "Installing dependencies..."
pnpm install

echo ""
echo "Setting up git hooks..."
pnpm prepare

echo ""
echo "✅ Project reset complete!"
echo ""
echo "Run 'pnpm dev' to start development"
