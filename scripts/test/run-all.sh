#!/usr/bin/env bash

# Run all tests across workspace

set -e

echo "🧪 Running all tests..."
echo ""

pnpm test

echo ""
echo "✅ All tests passed!"
