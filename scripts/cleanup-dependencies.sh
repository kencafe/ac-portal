#!/bin/bash

# Dependency Cleanup Script for AC Portal
# This script removes unused dependencies and updates outdated packages

set -e

echo "🔍 AC Portal Dependency Cleanup"
echo "================================"
echo ""

# Check if user wants aggressive or conservative cleanup
echo "Select cleanup option:"
echo "1) Aggressive - Remove all unused deps (recommended if blog is 3+ months away)"
echo "2) Conservative - Keep markdown deps, remove icons (recommended if blog coming soon)"
echo "3) Minimal - Only update React patches"
echo "4) Cancel"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    echo ""
    echo "🚀 Starting AGGRESSIVE cleanup..."
    echo ""

    # Remove all unused dependencies
    echo "📦 Removing unused dependencies..."
    npm uninstall lucide-react clsx gray-matter markdown-it @types/markdown-it

    # Update React
    echo "⬆️  Updating React to latest patch..."
    npm update react react-dom

    # Remove backup file
    if [ -f "src/app/page.tsx.backup" ]; then
      echo "🗑️  Removing backup file..."
      rm src/app/page.tsx.backup
    fi

    # Rebuild
    echo "🔨 Rebuilding dependencies..."
    npm install

    echo ""
    echo "✅ Aggressive cleanup complete!"
    echo "💾 Savings: ~30MB in node_modules"
    ;;

  2)
    echo ""
    echo "🚀 Starting CONSERVATIVE cleanup..."
    echo ""

    # Remove only icon and utility libs
    echo "📦 Removing unused icon and utility libraries..."
    npm uninstall lucide-react clsx

    # Update React
    echo "⬆️  Updating React to latest patch..."
    npm update react react-dom

    # Remove backup file
    if [ -f "src/app/page.tsx.backup" ]; then
      echo "🗑️  Removing backup file..."
      rm src/app/page.tsx.backup
    fi

    # Rebuild
    echo "🔨 Rebuilding dependencies..."
    npm install

    echo ""
    echo "✅ Conservative cleanup complete!"
    echo "💾 Savings: ~29MB in node_modules"
    echo "📝 Kept markdown dependencies for blog implementation"
    ;;

  3)
    echo ""
    echo "🚀 Starting MINIMAL updates..."
    echo ""

    # Just update React
    echo "⬆️  Updating React to latest patch..."
    npm update react react-dom

    # Remove backup file
    if [ -f "src/app/page.tsx.backup" ]; then
      echo "🗑️  Removing backup file..."
      rm src/app/page.tsx.backup
    fi

    echo ""
    echo "✅ Minimal update complete!"
    ;;

  4)
    echo "❌ Cancelled"
    exit 0
    ;;

  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "🧪 Testing build..."
npm run build

echo ""
echo "🎉 All done! Your dependencies are now optimized."
echo ""
echo "📊 Run 'du -sh node_modules' to see new size"
echo "📋 Check DEPENDENCY_AUDIT.md for full analysis"
