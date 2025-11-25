#!/bin/bash

echo "🔍 Checking Render Deployment Status"
echo "===================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get local commit hash
LOCAL_COMMIT=$(git rev-parse HEAD)
LOCAL_SHORT=$(git rev-parse --short HEAD)

echo -e "${BLUE}Local latest commit:${NC} $LOCAL_SHORT"
echo ""

# Check if backend has a version endpoint that shows commit
echo -e "${YELLOW}Checking backend deployment...${NC}"

# Test if our latest fixes are deployed by checking a specific endpoint behavior
echo "Testing endpoint that should work after our fixes..."

# Test the dbRun fix by trying to create a test project (this will fail with old code)
curl -s -X POST https://portfolio-backend-qxhg.onrender.com/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token-for-test" \
  -d '{"name":"Test","domain":"Web","technologies":"React","problemStatement":"Test"}' \
  | head -100

echo ""
echo -e "${BLUE}Manual checks:${NC}"
echo "1. Go to Render Dashboard: https://dashboard.render.com"
echo "2. Find service: portfolio-backend-qxhg"  
echo "3. Check 'Events' tab for latest deployment"
echo "4. Look for commit hash: $LOCAL_SHORT"
echo ""
echo -e "${YELLOW}If not deployed:${NC}"
echo "- Click 'Manual Deploy' → 'Deploy latest commit'"
echo "- Wait 2-3 minutes for deployment"