#!/bin/bash

echo "🧪 Running Portfolio Website CRUD Tests..."
echo "=========================================="
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to run tests."
    exit 1
fi

# Run the test script
node test-crud-operations.js

echo ""
echo "📋 Test Instructions:"
echo "1. Login to admin panel at your deployed site"
echo "2. Check Site Settings → Pages → Contact Page"
echo "3. Look for entries with '.' markers (e.g., 'test@example.com.')"
echo "4. Try updating any field and verify it saves"
echo ""
echo "🔍 What to verify:"
echo "- Contact email and phone fields save/load correctly"
echo "- All admin form inputs persist to database"
echo "- Changes reflect immediately in the UI"
echo "- No data loss on page refresh"