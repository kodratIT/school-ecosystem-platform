#!/usr/bin/env bash

# Run tests in watch mode

set -e

echo "🧪 Running tests in watch mode..."
echo ""
echo "Press Ctrl+C to stop"
echo ""

pnpm test:watch
