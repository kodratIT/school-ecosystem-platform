#!/usr/bin/env bash

# Clean all build artifacts and dependencies

set -e

echo "🧹 Cleaning project..."
echo ""

# Remove node_modules
echo "Removing node_modules..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Remove build artifacts
echo "Removing build artifacts..."
find . -name "dist" -type d -prune -exec rm -rf '{}' +
find . -name ".next" -type d -prune -exec rm -rf '{}' +
find . -name ".turbo" -type d -prune -exec rm -rf '{}' +
find . -name "out" -type d -prune -exec rm -rf '{}' +

# Remove TypeScript build info
echo "Removing TypeScript build info..."
find . -name "*.tsbuildinfo" -type f -delete

# Remove coverage
echo "Removing coverage..."
find . -name "coverage" -type d -prune -exec rm -rf '{}' +

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Run 'pnpm install' to reinstall dependencies"
