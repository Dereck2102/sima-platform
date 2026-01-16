# SIMA Geo-Tracker Service

Servicio de rastreo de activos en tiempo real implementado en Go.

## 🚀 Features

- **Goroutines**: Procesamiento concurrente de ubicaciones
- **WebSocket**: Actualizaciones en tiempo real a clientes
- **Multi-tenant**: Filtrado por tenantId
- **Thread-safe**: Mutex para acceso seguro a datos

## 📋 Endpoints

| Method | Path                       | Description                  |
| ------ | -------------------------- | ---------------------------- |
| GET    | `/api/health`              | Health check                 |
| GET    | `/api/locations`           | Get all locations for tenant |
| GET    | `/api/locations/{assetId}` | Get single asset location    |
| POST   | `/api/locations`           | Update asset location        |
| WS     | `/ws?tenantId=xxx`         | Real-time updates            |

## 🏃 Running

```bash
# Download dependencies
cd apps/geo-tracker
go mod download

# Run with device simulation
SIMULATE_DEVICES=true go run main.go

# Run without simulation (only accepts API updates)
go run main.go
```

## 📡 WebSocket Messages

**Client connects to:** `ws://localhost:3009/ws?tenantId=uce-001`

**Initial message received:**

```json
{
  "type": "initial_locations",
  "locations": [...]
}
```

**Location update received:**

```json
{
  "type": "location_update",
  "location": {
    "assetId": "asset-uce-1",
    "latitude": -0.1807,
    "longitude": -78.4678,
    "speed": 45.2,
    "heading": 180.5,
    "accuracy": 10.0,
    "timestamp": "2026-01-15T17:00:00Z",
    "tenantId": "uce-001"
  }
}
```

## 📦 Location Object

```go
type Location struct {
    AssetID   string    // Unique asset identifier
    Latitude  float64   // GPS latitude
    Longitude float64   // GPS longitude
    Speed     float64   // Speed in km/h
    Heading   float64   // Direction in degrees (0-360)
    Accuracy  float64   // GPS accuracy in meters
    Timestamp time.Time // UTC timestamp
    TenantID  string    // Tenant identifier
}
```

## 🐳 Docker

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
RUN CGO_ENABLED=0 go build -o geo-tracker

FROM alpine:3.19
COPY --from=builder /app/geo-tracker /geo-tracker
EXPOSE 3009
CMD ["/geo-tracker"]
```
