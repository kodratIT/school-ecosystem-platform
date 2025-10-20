#!/usr/bin/env bash

# Build all packages and applications

set -e

echo "🏗️  Building all packages and applications..."
echo ""

pnpm build

echo ""
echo "✅ Build complete!"
