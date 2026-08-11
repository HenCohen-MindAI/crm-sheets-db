# 🧠 MIND AI CRM - Professional Customer Management System

**MIND AI CRM** is a lightweight, production-ready SaaS CRM system designed for sales teams, service businesses, and customer-centric organizations. Built with Node.js, Express, and Google Sheets as the data store.

![MIND AI Logo](./public/logo.png)

## ✨ Features

### 👥 Customer Management
- Complete customer profiles with contact info
- Custom fields and attributes
- Customer activity timeline
- Bulk import/export capabilities

### 🎯 Pipeline Management
- Unlimited pipelines and stages
- Drag-and-drop customer movement between stages
- Custom stage colors and properties
- Stage-based automation rules

### ✓ Task Management
- Create and assign tasks
- Priority levels (Low, Medium, High)
- Due dates and reminders
- Task status tracking (Open, In Progress, Completed)
- 3-column Kanban board view

### 📊 Dashboard & Analytics
- Real-time customer statistics
- New customers this month
- Task completion rates
- Activity feed
- Quick access shortcuts

### 🔗 Webhooks & Automation
- Event-based webhooks for all major actions
- Activepieces integration ready
- Support for:
  - `customer.created`
  - `customer.updated`
  - `customer.stage_changed`
  - And more...

### 🔐 Security & Multi-Tenancy
- JWT-based authentication
- API key management
- Role-based access control (RBAC)
- Complete tenant isolation
- GDPR-compliant

### 🌍 Internationalization
- Full Hebrew RTL support
- Easy to extend to other languages
- Bilingual-ready UI components

### 💾 Google Sheets Integration
- Use Google Sheets as your database
- No expensive database infrastructure
- Easy data export and backup
- Real-time collaboration with Google Sheets features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (or Docker)
- Google account (optional, for Google Sheets)
- 1GB+ RAM VPS (e.g., Oracle, Linode, DigitalOcean)

### Local Development
```bash
# Clone repository
git clone https://github.com/YOUR-REPO/crm-sheets-db.git
cd crm-sheets-db

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Docker Deployment (Recommended)
```bash
# Build and run
docker compose up -d --build

# Open http://localhost:3050
```

**Default Login:**
- Email: `admin@test.com`
- Password: `password`

## 📁 Project Structure

```
crm-sheets-db/
├── src/
│   ├── server.js                 # Express server entry point
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── tenant.js            # Multi-tenant context
│   │   └── errors.js            # Error handling
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── customers.js         # Customer CRUD
│   │   ├── pipelines.js         # Pipeline management
│   │   ├── tasks.js             # Task management
│   │   ├── notes.js             # Notes/comments
│   │   ├── activity.js          # Activity logging
│   │   ├── webhooks.js          # Webhook management
│   │   ├── api-keys.js          # API key management
│   │   └── tenants.js           # Tenant configuration
│   ├── services/
│   │   ├── google-sheets.js     # Google Sheets API client
│   │   ├── data-service.js      # Repository factory
│   │   └── tenant-service.js    # Tenant management
│   └── repositories/
│       └── customer.repository.js # Customer data access layer
├── public/
│   └── index.html               # Single-page application
├── Dockerfile                    # Container definition
├── docker-compose.yml           # Orchestration
├── package.json                 # Dependencies
└── .env.example                 # Environment template
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login            # Login
POST   /api/auth/logout           # Logout
```

### Customers
```
GET    /api/customers             # List all
POST   /api/customers             # Create new
GET    /api/customers/:id         # Get single
PATCH  /api/customers/:id         # Update
DELETE /api/customers/:id         # Delete
```

### Pipelines
```
GET    /api/pipelines             # List all
POST   /api/pipelines             # Create new
GET    /api/pipelines/:id/stages  # Get stages
POST   /api/pipelines/:id/stages  # Create stage
PATCH  /api/pipelines/stages/:id  # Update stage
DELETE /api/pipelines/:id         # Delete pipeline
```

### Tasks
```
GET    /api/tasks                 # List all
POST   /api/tasks                 # Create new
PATCH  /api/tasks/:id             # Update
DELETE /api/tasks/:id             # Delete
```

### Webhooks
```
GET    /api/webhooks              # List all
POST   /api/webhooks              # Create new
DELETE /api/webhooks/:id          # Delete
```

### API Keys
```
GET    /api/api-keys              # List all
POST   /api/api-keys              # Generate new
DELETE /api/api-keys/:id          # Revoke
```

### Tenant Settings
```
GET    /api/tenants/me            # Get current tenant
PATCH  /api/tenants/me/spreadsheet # Update spreadsheet
```

## 🗂️ Using Google Sheets

### Setup
1. Create Google Cloud Project
2. Enable Google Sheets API
3. Create service account & download credentials.json
4. Place credentials.json in project root
5. Create Google Sheets with appropriate structure

### Spreadsheet Structure
See [DEPLOYMENT.md](./DEPLOYMENT.md#create-spreadsheet-structure) for detailed schema.

## 🔐 Security

- JWT tokens with 7-day expiry
- API key validation per request
- Tenant isolation at middleware level
- Role-based access control
- Input validation and sanitization
- CORS configured for security
- No sensitive data in logs

## 💾 Database

**Supported:**
- ✅ Google Sheets (recommended for SaaS)
- ✅ In-memory (mock, for testing)
- 🔄 Ready for: MongoDB, PostgreSQL, MySQL

Migration is easy thanks to repository pattern!

## 🎨 Customization

### Branding
Colors are defined in CSS variables:
```css
:root {
  --primary: #5B9FFF;
  --secondary: #001F5C;
  --accent: #4A8FFF;
}
```

Edit `public/index.html` CSS section to match your brand.

### Adding New Roles
Edit `src/middleware/tenant.js` for permission matrix.

### Webhook Events
Add new events in `src/routes/webhooks.js`.

## 📊 Performance

- Lightweight: ~50-80MB RAM in Docker
- Fast: Response times < 100ms for most queries
- Scalable: Designed for multi-tenant SaaS
- Efficient: Google Sheets caching layer

## 📝 License

Proprietary - Built for MIND AI

## 🤝 Contributing

This is a custom CRM built specifically for [Your Business]. For modifications or features, please contact the development team.

---

**Made with ❤️ for professional sales teams**

[🚀 Deployment Guide](./DEPLOYMENT.md) | [📚 API Docs](./API.md) | [⚙️ Configuration](./CONFIG.md)
