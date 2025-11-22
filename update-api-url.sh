#!/bin/bash

echo "🔧 API URL Update Script"
echo "======================="

# Get backend URL from user
read -p "Enter your Render backend URL (e.g., https://portfolio-backend-xxxx.onrender.com): " BACKEND_URL

# Update .env.production
echo "REACT_APP_API_URL=${BACKEND_URL}/api" > .env.production

# Update and redeploy
git add .env.production
git commit -m "Update API URL for production"
git push

echo "✅ API URL updated to: ${BACKEND_URL}/api"
echo "🚀 Vercel will auto-redeploy with new API URL"