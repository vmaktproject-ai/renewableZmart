#!/bin/bash
# RenewableZmart Production Deployment Script
# This script prepares the application for production deployment

echo "🚀 RenewableZmart Production Deployment Preparation"
echo "=================================================="

# Step 1: Check Node version
echo "✓ Checking Node.js version..."
node_version=$(node -v)
echo "  Node.js: $node_version"

# Step 2: Build Frontend
echo "✓ Building frontend..."
cd frontend || exit
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed!"
  exit 1
fi
cd ..

# Step 3: Build Backend
echo "✓ Building backend..."
cd backend || exit
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Backend build failed!"
  exit 1
fi
cd ..

# Step 4: Verify environment files
echo "✓ Checking environment configuration..."
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found. Please create it before deployment."
fi

# Step 5: Git checks
echo "✓ Checking Git status..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "⚠️  Not a Git repository. Initialize with: git init"
  exit 1
fi

# Step 6: Verify Docker
if command -v docker &> /dev/null; then
  echo "✓ Docker is installed"
  docker --version
else
  echo "⚠️  Docker not found. Install if deploying with Docker."
fi

echo ""
echo "=================================================="
echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review DEPLOYMENT_GUIDE_PRODUCTION.md"
echo "2. Set up environment variables on hosting platform"
echo "3. Deploy frontend to Vercel"
echo "4. Deploy backend to Render"
echo ""
echo "🌍 Your app will be live in ~15-20 minutes!"
echo "=================================================="
