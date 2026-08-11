# CRM Pro - Lightweight Multi-Tenant SaaS

Professional CRM system with Google Sheets integration, built for minimal resource usage.

**Stack**: Node.js + Express + Vanilla JS + Google Sheets  
**RAM**: 50-80 MB  
**Container**: 150 MB  
**Perfect for**: 1GB+ VPS

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone
git clone https://github.com/HenCohen-MindAI/crm-sheets-db.git
cd crm-sheets-db

# Setup environment
cp .env.example .env

# Run
docker compose up -d

# Open in browser
open http://localhost:3050
```

### Demo Login
- **Email**: admin@test.com
- **Password**: password

---

## 📦 Technology Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js 20 + Express |
| Frontend | HTML5 + Vanilla JS + Tailwind |
| Database | Google Sheets API |
| Auth | JWT + Google OAuth |
| Container | Docker Alpine |

---

## 🏗️ Architecture

### Tenant Isolation
```
Tenant A
  └─ Google Connection A
      └─ Google Sheets A
          ├─ Customers
          ├─ Pipelines
          ├─ Tasks
          └─ Activity Logs
```

Each tenant is completely isolated:
- Separate Google Sheets
- Separate JWT tokens
- Separate data in all queries

### API Structure

**Public Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /status              (health check)
GET    /health              (detailed health)
```

**Protected Endpoints:**
```
GET    /api/customers                (view all)
POST   /api/customers                (create)
GET    /api/customers/:id            (view one)
PATCH  /api/customers/:id            (edit)
DELETE /api/customers/:id            (delete)
```

---

## 🔐 Security

- ✓ JWT token authentication
- ✓ Tenant isolation on every request
- ✓ Permission-based access control
- ✓ No Google credentials exposed to frontend
- ✓ Secure error handling
- ✓ Rate limiting ready

---

## 📊 Memory Usage

| Component | RAM |
|-----------|-----|
| Node.js Runtime | 30-40 MB |
| Express + deps | 10-15 MB |
| Cache | 5-10 MB |
| Sessions | 1-3 MB |
| **Total** | **50-80 MB** |

---

## 🔧 Configuration

### Environment Variables

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key

# Optional - for Google Sheets
GOOGLE_SERVICE_ACCOUNT_KEY=./credentials.json
```

---

## 📝 API Examples

### Login
```bash
curl -X POST http://localhost:3050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

Response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "user-1",
    "email": "admin@test.com",
    "role": "admin",
    "tenantId": "tenant-1"
  }
}
```

### Get Customers
```bash
curl http://localhost:3050/api/customers \
  -H "Authorization: Bearer [TOKEN]"
```

### Create Customer
```bash
curl -X POST http://localhost:3050/api/customers \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "email": "john@example.com",
    "phone": "123456789",
    "company": "ACME Corp"
  }'
```

---

## 🐳 Docker Commands

```bash
# Start
docker compose up -d

# View logs
docker compose logs -f app

# Stop
docker compose down

# Restart
docker compose restart

# Rebuild
docker compose up -d --build
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3050/status
```

### Full Health Report
```bash
curl http://localhost:3050/health
```

---

## 📈 Scaling

The system is designed to be lightweight. For more users:

1. **Increase Caching**: Adjust TTL in config
2. **Add Load Balancer**: Multiple containers behind nginx
3. **Optimize Google Sheets**: Batch requests, reduce API calls
4. **Migrate to Database**: Swap GoogleSheetsRepository with PostgresRepository

---

## 🤝 Activepieces Integration

API is ready for Activepieces webhooks and automation.

Example: Create customer from Activepieces
```
POST /api/customers
Headers: Authorization: Bearer [API_KEY]
Body: { "first_name": "...", "email": "...", ... }
```

---

## 📞 Support

Check logs:
```bash
docker compose logs app
```

---

## 📄 License

MIT

---

**Built with ❤️ for startups and small businesses**
