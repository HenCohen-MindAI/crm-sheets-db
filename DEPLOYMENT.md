# 🚀 MIND AI CRM - Deployment Guide

## Prerequisites
- Ubuntu 20.04+ (Oracle VPS)
- Docker & Docker Compose installed
- Google Sheets API credentials (optional, for Google Sheets integration)
- 1GB+ RAM
- Open ports: 3050

## Quick Start (Oracle VPS)

### 1. SSH into your Oracle VPS
```bash
ssh ubuntu@your-oracle-ip
```

### 2. Clone the repository
```bash
cd ~
git clone https://github.com/YOUR-REPO/crm-sheets-db.git
cd crm-sheets-db
```

### 3. Configure Environment
```bash
# Copy and edit environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 4. Build and Run with Docker
```bash
# Pull latest changes
git pull origin main

# Build and start
docker compose down
docker image rm crm-sheets-db-app -f 2>/dev/null || true
docker compose up -d --build

# Monitor logs
docker compose logs -f app
```

### 5. Access the Application
Open your browser and go to:
```
http://your-oracle-ip:3050
```

**Demo Login:**
- Email: `admin@test.com`
- Password: `password`

## Configuration

### .env File Template
```env
NODE_ENV=production
PORT=3000

# JWT Secret (change in production!)
JWT_SECRET=your_super_secret_key_here

# Google Sheets (optional)
GOOGLE_SHEETS_CLIENT_ID=your_client_id
GOOGLE_SHEETS_CLIENT_SECRET=your_secret
GOOGLE_SHEETS_REDIRECT_URI=http://localhost:3050/auth/google/callback
DEMO_SPREADSHEET_ID=your_spreadsheet_id
```

## Using Google Sheets as Database

### Setup Steps:
1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a service account
4. Download credentials.json
5. Place in root directory

### Create Spreadsheet Structure
In Google Sheets, create these sheets:

**Sheet 1: "Customers"**
| ID | tenant_id | first_name | last_name | email | phone | company | pipeline_id | stage_id | owner_id | status | created_at | updated_at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

**Sheet 2: "Pipelines"**
| ID | tenant_id | name | description | position | active | created_at | updated_at |

**Sheet 3: "Tasks"**
| ID | tenant_id | title | description | customer_id | priority | status | due_date | user_id | created_at | updated_at |

## Multi-Tenant Setup

Each tenant gets their own Google Sheets spreadsheet.

### In Settings page:
1. Get your Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/**YOUR-ID**/edit`
2. Paste into "Google Sheets Setup" section
3. Click "Save Settings"

## API Authentication

### Login
```bash
curl -X POST http://localhost:3050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

Response includes JWT token for subsequent requests.

### Using API Key
Generate in Settings → API Keys, then use:
```bash
curl -H "x-api-key: your-api-key" http://localhost:3050/api/customers
```

## Webhooks (Activepieces Integration)

Setup webhooks in the UI:
1. Go to Webhooks section
2. Select event type (customer.created, customer.updated, etc.)
3. Enter your Activepieces webhook URL
4. Click "Add Webhook"

Webhooks trigger automatically on events.

## Troubleshooting

### Port Already in Use
```bash
# Change port in docker-compose.yml or kill existing process
sudo lsof -i :3050
sudo kill -9 <PID>
```

### Docker Build Fails
```bash
docker system prune -a --volumes
docker compose up -d --build
```

### Changes Not Showing
```bash
# Full rebuild
docker compose down
docker image rm crm-sheets-db-app -f
docker compose up -d --build
```

### View Logs
```bash
docker compose logs app
docker compose logs -f app  # Follow mode
```

## Production Recommendations

1. **Use HTTPS** - Configure nginx reverse proxy
2. **JWT Secret** - Use strong, unique secret in production
3. **Google Sheets Auth** - Properly authenticate with service account
4. **Resource Limits** - Set memory/CPU limits in docker-compose
5. **Backups** - Regularly backup your Google Sheets data
6. **Monitoring** - Use health check endpoint: `/health`

## Updates

To update to latest version:
```bash
cd crm-sheets-db
git pull origin main
docker compose down
docker image rm crm-sheets-db-app -f
docker compose up -d --build
```

## Support

For issues:
1. Check logs: `docker compose logs app`
2. Verify `.env` configuration
3. Ensure ports are open: `sudo ufw allow 3050/tcp`
4. Check Docker daemon: `docker ps`

---

**MIND AI CRM** - Professional Customer Management System
Built with Node.js, Express, Google Sheets & Docker
