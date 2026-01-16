# Tenant Service - Quick Start Guide

## 🚀 Starting the Services

### 1. Start infrastructure (PostgreSQL only needed for tenant-service)

```bash
docker-compose up -d postgres
```

### 2. Start Tenant Service (Port 3003)

```bash
npx nx serve tenant-service
```

### 3. Start Auth Service (Port 3002)

```bash
npx nx serve auth-service
```

### 4. Start API Gateway (Port 3000)

```bash
npx nx serve api-gateway
```

## 🧪 Testing Multi-Tenancy

### Create a Tenant

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Facultad de Ingeniería",
    "code": "uce-engineering",
    "description": "Facultad de Ingeniería y Ciencias Aplicadas",
    "settings": {
      "maxAssets": 10000,
      "enableGeolocation": true
    }
  }'
```

### List All Tenants

```bash
curl -X GET http://localhost:3000/api/tenants
```

### Get Tenant by Code

```bash
curl -X GET http://localhost:3000/api/tenants/code/uce-engineering
```

### Update Tenant

```bash
curl -X PATCH http://localhost:3000/api/tenants/TENANT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Facultad de Ingeniería - Actualizada",
    "isActive": true
  }'
```

### Deactivate Tenant (Soft Delete)

```bash
curl -X DELETE http://localhost:3000/api/tenants/TENANT_ID
```

## 🔐 Testing Data Isolation

### Scenario: Two Tenants Cannot See Each Other's Assets

**Step 1:** Create two tenants

```bash
# Tenant A: Engineering
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{"name":"Engineering","code":"engineering"}'

# Tenant B: Medicine
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{"name":"Medicine","code":"medicine"}'
```

**Step 2:** Register users for each tenant

```bash
# User A (Engineering)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"eng@uce.edu.ec",
    "password":"eng12345",
    "fullName":"Engineering User",
    "role":"admin",
    "tenantId":"ENGINEERING_TENANT_ID"
  }'

# User B (Medicine)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"med@uce.edu.ec",
    "password":"med12345",
    "fullName":"Medicine User",
    "role":"admin",
    "tenantId":"MEDICINE_TENANT_ID"
  }'
```

**Step 3:** Create assets with each user's token

```bash
# Engineering asset (use Engineering user's token)
TOKEN_ENG="..." # From step 2 register response

curl -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer $TOKEN_ENG" \
  -H "Content-Type: application/json" \
  -d '{
    "internalCode":"ENG-001",
    "name":"Engineering Laptop",
    "price":1500,
    "acquisitionDate":"2024-01-15",
    "locationId":"building-a"
  }'

# Medicine asset (use Medicine user's token)
TOKEN_MED="..." # From step 2 register response

curl -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer $TOKEN_MED" \
  -H "Content-Type: application/json" \
  -d '{
    "internalCode":"MED-001",
    "name":"Medical Equipment",
    "price":5000,
    "acquisitionDate":"2024-01-15",
    "locationId":"hospital-wing"
  }'
```

**Step 4:** Verify isolation - each user only sees their own assets

```bash
# Engineering user lists assets (should only see ENG-001)
curl -X GET http://localhost:3000/api/assets \
  -H "Authorization: Bearer $TOKEN_ENG"

# Medicine user lists assets (should only see MED-001)
curl -X GET http://localhost:3000/api/assets \
  -H "Authorization: Bearer $TOKEN_MED"
```

## ✅ Verification Checklist

- [ ] Tenant creation works
- [ ] Tenants have unique codes (duplicate fails)
- [ ] Assets are automatically tagged with tenantId
- [ ] User A cannot see User B's assets
- [ ] GET /api/assets filters by tenantId automatically
- [ ] Composite unique index (tenantId + internalCode) works
- [ ] Cross-tenant asset access returns 404

## 🔐 Multi-Tenancy Features Implemented

✅ **Tenant Entity** - UUID, unique code, JSONB settings  
✅ **Automatic Isolation** - All queries filter by tenantId  
✅ **Composite Index** - (tenantId, internalCode) unique constraint  
✅ **Tenant Context** - Extracted from JWT payload  
✅ **Soft Delete** - Deactivation instead of hard delete  
✅ **Settings per Tenant** - Flexible JSONB configuration

## 📡 Architecture

```
User (Tenant A) → JWT (tenantId: A) → API Gateway → Inventory Service
                                                    ↓
                                         Filter: WHERE tenantId = 'A'
                                                    ↓
                                              PostgreSQL (only Tenant A data)
```

## 🛠️ Next Steps

1. Add Swagger documentation for all endpoints
2. Implement rate limiting
3. Create GitHub Actions CI/CD
4. Deploy with Terraform to AWS
