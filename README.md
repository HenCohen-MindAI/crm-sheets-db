# CRM + Google Sheets DB

Multi-tenant CRM system with Google Sheets as the database.

## Architecture

- **Tenant**: Business entity
- **Google Connection**: One per tenant (via service account)
- **Google Sheets**: Data store for tenant
- **Users**: Employees with roles and permissions
- **Roles & Permissions**: Fine-grained access control

## Setup

### 1. Prerequisites

- Docker & Docker Compose
- Google Cloud Project with Sheets API enabled
- Service Account JSON credentials

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
- `GOOGLE_SERVICE_ACCOUNT_KEY` path to credentials.json
- `JWT_SECRET` for token signing

### 3. Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a Service Account
3. Download the JSON key file
4. Place it as `credentials.json` in project root
5. Share your Google Sheets with the service account email

### 4. Run

```bash
docker-compose up
```

Server starts on `http://localhost:3000`

## API

### Authentication

```bash
# Login (mock)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

Response:
```json
{
  "token": "eyJhbGc...",
  "user": { "id": "user-1", "email": "admin@test.com", "role": "admin" }
}
```

### Protected Endpoint

```bash
curl http://localhost:3000/health \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Project Structure

```
src/
├── index.js              # Main server
├── db/
│   └── sheets.js         # Google Sheets API integration
├── middleware/
│   ├── auth.js           # JWT authentication
│   └── tenant.js         # Tenant context & permissions
└── routes/
    └── auth.js           # Auth endpoints
```

## Next Steps

- [ ] Connect to actual Google Sheet
- [ ] Add customer management endpoints
- [ ] Add user management endpoints
- [ ] Add role/permission management
- [ ] Add pipeline management
- [ ] Add task management
- [ ] Add real database (Tenants, Users, Roles, Permissions)
- [ ] Add real Google OAuth flow
- [ ] Add activity logging
- [ ] Add webhooks
