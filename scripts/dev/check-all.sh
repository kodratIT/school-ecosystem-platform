#!/usr/bin/env bash

# Run all checks (type-check, lint, format-check)

set -e

echo "🔍 Running all checks..."
echo ""

echo "📘 Type checking..."
pnpm type-check

echo ""
echo "🔎 Linting..."
pnpm lint

echo ""
echo "💅 Format checking..."
pnpm format:check

echo ""
echo "✅ All checks passed!"
