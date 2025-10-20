#!/usr/bin/env bash

# Run all checks before building

set -e

echo "🔍 Running pre-build checks..."
echo ""

# Type check
echo "📘 Type checking..."
pnpm type-check

# Lint
echo "🔎 Linting..."
pnpm lint

# Build
echo "🏗️  Building..."
pnpm build

echo ""
echo "✅ All checks passed and build complete!"
