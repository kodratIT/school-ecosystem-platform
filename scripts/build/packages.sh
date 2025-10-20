#!/usr/bin/env bash

# Build only shared packages (@repo/*)

set -e

echo "📦 Building shared packages..."
echo ""

pnpm build --filter="@repo/*"

echo ""
echo "✅ Packages built successfully!"
