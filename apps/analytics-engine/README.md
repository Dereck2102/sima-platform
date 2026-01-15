# SIMA Analytics Engine

Python-based analytics service for asset statistical analysis.

## Tech Stack

- **Framework:** FastAPI
- **Data Processing:** pandas, numpy
- **Port:** 3010

## Endpoints

| Method | Path                                 | Description                                   |
| ------ | ------------------------------------ | --------------------------------------------- |
| GET    | `/api/health`                        | Health check                                  |
| GET    | `/api/analytics/assets/summary`      | Complete asset summary                        |
| GET    | `/api/analytics/assets/by-status`    | Distribution by status                        |
| GET    | `/api/analytics/assets/by-condition` | Distribution by condition                     |
| GET    | `/api/analytics/assets/value`        | Value analysis (total, avg, max, min, median) |
| GET    | `/api/analytics/trends/monthly`      | Monthly creation trends                       |

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run with hot reload
nx serve analytics-engine

# Or directly
uvicorn main:app --reload --port 3010
```

## Docker

```bash
# Build image
nx docker-build analytics-engine

# Run container
docker run -p 3010:3010 sima-analytics-engine
```

## Environment Variables

| Variable                  | Default               | Description           |
| ------------------------- | --------------------- | --------------------- |
| `PORT`                    | 3010                  | Server port           |
| `INVENTORY_SERVICE_URL`   | http://localhost:3001 | Inventory service URL |
| `KAFKA_BOOTSTRAP_SERVERS` | localhost:9092        | Kafka brokers         |

## API Documentation

When running, visit: http://localhost:3010/docs
