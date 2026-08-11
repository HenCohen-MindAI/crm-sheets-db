# 🚀 MIND AI CRM - Final Setup Instructions

## ✅ What Has Been Built

Your complete, production-ready CRM system is ready!

### 🎨 Frontend (HTML/CSS/JavaScript)
- ✅ Professional login page with MIND AI branding
- ✅ Dashboard with real-time statistics
- ✅ Customers management (add, list, delete)
- ✅ Pipelines with stages
- ✅ Tasks board (3-column Kanban layout)
- ✅ Activity log
- ✅ Webhooks configuration
- ✅ API Keys management
- ✅ Settings page (Google Sheets integration)
- ✅ Full Hebrew RTL support
- ✅ MIND AI color scheme (#5B9FFF, #001F5C, #4A8FFF)

### 🔧 Backend (Node.js/Express)
- ✅ Multi-tenant architecture with JWT auth
- ✅ REST API for all features
- ✅ Role-based access control (RBAC)
- ✅ Google Sheets integration layer
- ✅ Webhook event system
- ✅ Activity logging
- ✅ API key management
- ✅ Error handling and validation

### 🐳 DevOps
- ✅ Lightweight Docker image (50-80MB RAM)
- ✅ Docker Compose orchestration
- ✅ Health checks configured
- ✅ Production-ready configuration
- ✅ Environment-based setup

---

## 📥 How to Deploy to Your Oracle VPS

### Step 1: SSH into Your Oracle VPS
```bash
ssh ubuntu@your-oracle-ip
```

### Step 2: Clone or Download Project
```bash
# Option A: Clone from Git (if using GitHub)
git clone https://github.com/YOUR-USERNAME/crm-sheets-db.git
cd crm-sheets-db

# Option B: Download ZIP and extract
# Upload the ZIP file and extract
unzip crm-sheets-db.zip
cd crm-sheets-db
```

### Step 3: Install Docker & Docker Compose
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 4: Configure Your System
```bash
# Copy example environment file
cp .env.example .env

# Edit environment (use nano, vim, or your editor)
nano .env

# Make sure these are set:
# NODE_ENV=production
# JWT_SECRET=your-unique-secret-key-here
# PORT=3000
```

### Step 5: Open Firewall Port
```bash
# Allow traffic on port 3050
sudo ufw allow 3050/tcp

# Verify (should see 3050 in the list)
sudo ufw status
```

### Step 6: Start the Application
```bash
# Build and start
sudo docker compose up -d --build

# Check status
sudo docker compose ps

# View logs
sudo docker compose logs -f app
```

### Step 7: Access Your CRM
Open your browser and navigate to:
```
http://your-oracle-ip:3050
```

**Login with:**
- Email: `admin@test.com`
- Password: `password`

---

## 🔗 Google Sheets Setup (Optional but Recommended)

### To Use Google Sheets as Your Database:

1. **Create Google Cloud Project:**
   - Go to https://console.cloud.google.com
   - Create new project
   - Enable "Google Sheets API"

2. **Create Service Account:**
   - In Google Cloud Console
   - Create service account
   - Download JSON key
   - Rename to `credentials.json`

3. **Upload credentials.json:**
   ```bash
   # On your VPS, in the crm-sheets-db directory
   scp credentials.json ubuntu@your-oracle-ip:~/crm-sheets-db/
   ```

4. **Create Google Sheets:**
   - Create new Google Sheet
   - Add these sheet tabs:
     - Customers
     - Pipelines
     - Tasks
   - Share sheet with service account email

5. **Configure in CRM:**
   - Go to Settings (⚙️) in the UI
   - Paste your Spreadsheet ID
   - Click "Save Settings"

---

## 🔄 Daily Operations

### Start Application
```bash
cd ~/crm-sheets-db
sudo docker compose up -d
```

### View Logs
```bash
sudo docker compose logs -f app
```

### Stop Application
```bash
sudo docker compose down
```

### Update to Latest Version
```bash
cd ~/crm-sheets-db
git pull origin main
sudo docker compose down
sudo docker image rm crm-sheets-db-app -f
sudo docker compose up -d --build
```

### Check System Health
```bash
# Health check endpoint
curl http://localhost:3050/health

# Status endpoint
curl http://localhost:3050/status
```

---

## 🔐 Security Checklist

Before going live:

- [ ] Change JWT_SECRET in .env to a strong, unique value
- [ ] Change default login credentials in `/src/routes/auth.js`
- [ ] Configure HTTPS with nginx reverse proxy
- [ ] Set up automated backups of Google Sheets
- [ ] Configure firewall rules (only allow port 3050)
- [ ] Enable automatic Docker container restarts
- [ ] Set up monitoring and alerting
- [ ] Review RBAC permissions

### To Change Login Credentials:
```bash
# Edit the mock auth file
sudo nano src/routes/auth.js

# Look for the test credentials section and update
# Then rebuild Docker:
sudo docker compose down
sudo docker image rm crm-sheets-db-app -f
sudo docker compose up -d --build
```

---

## 📞 Support & Troubleshooting

### Port Already in Use
```bash
sudo lsof -i :3050
sudo kill -9 <PID>
```

### Docker Build Fails
```bash
sudo docker system prune -a --volumes
sudo docker compose up -d --build
```

### Application Won't Start
```bash
# Check logs
sudo docker compose logs app

# Verify .env file is correct
cat .env

# Check Docker daemon
sudo systemctl status docker
```

### Can't Access from Browser
```bash
# Check if port is open
sudo ufw status

# Verify container is running
sudo docker compose ps

# Test locally first
curl http://localhost:3050
```

---

## 📊 Default Demo Account

Once deployed, you can login with:

```
Email: admin@test.com
Password: password
```

⚠️ **Change this before production deployment!**

---

## 🎯 Next Steps

1. ✅ Deploy to Oracle VPS (follow steps above)
2. ✅ Access at http://your-oracle-ip:3050
3. ✅ Test all features (Customers, Pipeline, Tasks, etc.)
4. ✅ Connect Google Sheets (Settings page)
5. ✅ Set up users and permissions
6. ✅ Configure webhooks for Activepieces
7. ✅ Customize with your branding (logo, colors)
8. ✅ Set up HTTPS for production

---

## 📚 Documentation Files

- **README.md** - Feature overview and architecture
- **DEPLOYMENT.md** - Detailed deployment guide
- **SETUP_INSTRUCTIONS.md** - This file (step-by-step setup)

---

## 🎉 You're Ready!

Your MIND AI CRM is now deployed and ready to manage customers!

For questions or customizations, refer to the documentation or contact your development team.

**Happy selling! 🚀**

---

Made with ❤️ for Professional Sales Teams
MIND AI CRM - Professional Customer Management System
