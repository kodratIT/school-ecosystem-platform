#!/usr/bin/env bash

# Run tests with coverage report

set -e

echo "🧪 Running tests with coverage..."
echo ""

pnpm test:coverage

echo ""
echo "✅ Coverage report generated!"
echo "📊 Check coverage/ directory for detailed report"
