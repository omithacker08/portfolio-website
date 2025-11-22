#!/bin/bash

echo "🚀 Portfolio Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo -e "${BLUE}Checking requirements...${NC}"
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is required but not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is required but not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements met${NC}"
}

# Initialize git repository
setup_git() {
    echo -e "${BLUE}Setting up Git repository...${NC}"
    
    if [ ! -d ".git" ]; then
        git init
        echo -e "${GREEN}✅ Git repository initialized${NC}"
    else
        echo -e "${YELLOW}⚠️  Git repository already exists${NC}"
    fi
    
    # Create .gitignore if it doesn't exist
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << EOF
# Dependencies
node_modules/
backend/node_modules/

# Production builds
build/
dist/

# Environment variables
.env
.env.local
.env.production.local

# Database
*.db
backend/*.db
backend/data/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF
        echo -e "${GREEN}✅ .gitignore created${NC}"
    fi
}

# Build frontend
build_frontend() {
    echo -e "${BLUE}Building frontend...${NC}"
    npm install
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend built successfully${NC}"
    else
        echo -e "${RED}❌ Frontend build failed${NC}"
        exit 1
    fi
}

# Install backend dependencies
setup_backend() {
    echo -e "${BLUE}Setting up backend...${NC}"
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
}

# Commit changes
commit_changes() {
    echo -e "${BLUE}Committing changes...${NC}"
    git add .
    git commit -m "Deploy: Ready for production deployment" || echo "No changes to commit"
    echo -e "${GREEN}✅ Changes committed${NC}"
}

# Main deployment function
main() {
    echo -e "${YELLOW}Starting deployment preparation...${NC}"
    
    check_requirements
    setup_git
    setup_backend
    build_frontend
    commit_changes
    
    echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Push to GitHub: git remote add origin <your-repo-url> && git push -u origin main"
    echo "2. Deploy backend to Render (see instructions below)"
    echo "3. Deploy frontend to Vercel (see instructions below)"
    echo "4. Update API URL in production"
}

# Run main function
main