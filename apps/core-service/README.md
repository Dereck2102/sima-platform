# Auth Service - Quick Start Guide

## 🚀 Starting the Services

### 1. Start infrastructure (PostgreSQL, MongoDB, Kafka, Redis)
```bash
docker-compose up -d
```

### 2. Start Auth Service (Port 3002)
```bash
npx nx serve auth-service
```

### 3. Start Inventory Service (Port 3001)
```bash
npx nx serve inventory-service
```

### 4. Start API Gateway (Port 3000)
```bash
npx nx serve api-gateway
```

## 🧪 Testing Authentication

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@uce.edu.ec\",
    \"password\": \"admin12345\",
    \"fullName\": \"Admin UCE\",
    \"role\": \"admin\",
    \"tenantId\": \"uce-faculty-1\"
  }"
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhb...",
  "expiresIn": 900,
  "user": {
    "id": "uuid-here",
    "email": "admin@uce.edu.ec",
    "fullName": "Admin UCE",
    "role": "admin",
    "tenantId": "uce-faculty-1"
  }
}
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type": application/json" \
  -d "{
    \"email\": \"admin@uce.edu.ec\",
    \"password\": \"admin12345\"
  }"
```

### Access Protected Profile
```bash
# Replace YOUR_TOKEN with the accessToken from login/register response
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"YOUR_REFRESH_TOKEN\"
  }"
```

## ✅ Verification Checklist

- [ ] Register returns JWT tokens
- [ ] Login works with correct credentials
- [ ] Login fails with wrong password (401 Unauthorized)
- [ ] Profile endpoint requires Bearer token
- [ ] Profile endpoint returns user data when authenticated
- [ ] Refresh token generates new access token
- [ ] Password is hashed in database (not plain text)

## 🔐 Security Features Implemented

✅ **JWT Authentication** - 15min access token, 7 days refresh token  
✅ **Password Hashing** - Bcrypt with salt rounds  
✅ **Guards** - JwtAuthGuard for protected routes  
✅ **Roles** - ADMIN, AUDITOR, OPERATOR, VIEWER  
✅ **Validation** - Class-validator on all DTOs  
✅ **CORS** - Enabled with credentials support  

## 📡 Routing

```
http://localhost:3000/api/auth/*  →  http://localhost:3002/api/auth/*  (Auth Service)
http://localhost:3000/api/assets/* →  http://localhost:3001/api/assets/* (Inventory Service)
```

## 🛠️ Next Steps

1. Add rate limiting to API Gateway
2. Implement tenant service
3. Add Swagger documentation
4. Create CI/CD pipeline
5. Deploy to AWS with Terraform
