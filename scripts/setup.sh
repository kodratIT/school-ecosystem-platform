#!/usr/bin/env bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  School Ecosystem - Project Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm not found. Installing...${NC}"
    npm install -g pnpm
fi
echo -e "${GREEN}✓${NC} pnpm $(pnpm --version)"

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found. Please install Git${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Git $(git --version | head -n 1)"

echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
pnpm install

echo ""
echo -e "${YELLOW}Setting up git hooks...${NC}"
pnpm prepare

echo ""
echo -e "${YELLOW}Creating .env.local files...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓${NC} Created .env.local"
    echo -e "${YELLOW}⚠️  Please fill in your environment variables in .env.local${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Fill in .env.local with your credentials"
echo "2. Run type-check: pnpm type-check"
echo "3. Run lint: pnpm lint"
echo ""
