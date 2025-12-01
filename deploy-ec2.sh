#!/bin/bash

# Gen-AI Education Platform - EC2 Deployment Script
# Run this script on your EC2 instance after connecting via SSH

set -e  # Exit on error

echo "🚀 Starting Gen-AI Education Platform Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo -e "${BLUE}📦 Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11
echo -e "${BLUE}🐍 Installing Python 3.11...${NC}"
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install Git
echo -e "${BLUE}📦 Installing Git...${NC}"
sudo apt install -y git

# Install Nginx
echo -e "${BLUE}🌐 Installing Nginx...${NC}"
sudo apt install -y nginx

# Install PM2
echo -e "${BLUE}📦 Installing PM2...${NC}"
sudo npm install -g pm2

# Clone repository
echo -e "${BLUE}📥 Cloning repository...${NC}"
cd ~
if [ -d "Gen-AI-Education-Platform" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd Gen-AI-Education-Platform
    git pull origin main
else
    git clone https://github.com/Karthik8402/Gen-AI-Education-Platform.git
    cd Gen-AI-Education-Platform
fi

# Setup Backend
echo -e "${BLUE}🔧 Setting up Backend...${NC}"
cd back-end
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Prompt for environment variables
echo -e "${GREEN}Please enter your environment variables:${NC}"
read -p "MongoDB URI: " MONGO_URI
read -p "Gemini API Key: " GEMINI_API_KEY
read -p "JWT Secret: " JWT_SECRET

# Create .env file
cat > .env << EOF
MONGO_URI=${MONGO_URI}
GEMINI_API_KEY=${GEMINI_API_KEY}
JWT_SECRET=${JWT_SECRET}
PORT=5000
EOF

echo -e "${GREEN}✅ Backend .env created${NC}"

# Setup Frontend
echo -e "${BLUE}🔧 Setting up Frontend...${NC}"
cd ../frontend
npm install

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Create frontend .env
cat > .env << EOF
VITE_API_URL=http://${EC2_IP}:5000
EOF

echo -e "${GREEN}✅ Frontend .env created with API URL: http://${EC2_IP}:5000${NC}"

# Build frontend
echo -e "${BLUE}🏗️  Building frontend...${NC}"
npm run build

# Start services with PM2
echo -e "${BLUE}🚀 Starting services with PM2...${NC}"
cd ~/Gen-AI-Education-Platform/back-end
pm2 start app.py --name gen-ai-backend --interpreter python3

cd ~/Gen-AI-Education-Platform/frontend
pm2 serve dist 3000 --name gen-ai-frontend --spa

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup | tail -n 1 | bash

# Configure Nginx
echo -e "${BLUE}🌐 Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/gen-ai > /dev/null << EOF
server {
    listen 80;
    server_name ${EC2_IP};

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/gen-ai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Add swap space (for t2.micro with 1GB RAM)
echo -e "${BLUE}💾 Adding swap space...${NC}"
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Your application is now live!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Frontend: ${BLUE}http://${EC2_IP}${NC}"
echo -e "Backend API: ${BLUE}http://${EC2_IP}/api${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check service status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart services"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
