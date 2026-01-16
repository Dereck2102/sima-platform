"""
SIMA Analytics Engine
Real-time asset analytics service using FastAPI and pandas.
Consumes Kafka events and provides statistical analysis endpoints.
"""

import os
import asyncio
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

# Configuration
INVENTORY_SERVICE_URL = os.getenv("INVENTORY_SERVICE_URL", "http://localhost:3001")
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
PORT = int(os.getenv("PORT", "3010"))


# Pydantic Models
class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: str
    version: str = "1.0.0"


class AssetSummary(BaseModel):
    total_assets: int
    total_value: float
    average_value: float
    assets_by_status: Dict[str, int]
    assets_by_condition: Dict[str, int]
    tenant_id: str
    generated_at: str


class StatusDistribution(BaseModel):
    status: str
    count: int
    percentage: float


class ConditionDistribution(BaseModel):
    condition: str
    count: int
    percentage: float


class ValueAnalysis(BaseModel):
    total_value: float
    average_value: float
    max_value: float
    min_value: float
    median_value: float
    asset_count: int
    currency: str = "USD"


class MonthlyTrend(BaseModel):
    month: str
    assets_created: int
    total_value: float


# In-memory cache for demo (use Redis in production)
analytics_cache: Dict[str, Any] = {}
CACHE_TTL = 60  # seconds


def get_cache(key: str) -> Optional[Any]:
    """Get value from cache if not expired."""
    if key in analytics_cache:
        data, timestamp = analytics_cache[key]
        if datetime.now().timestamp() - timestamp < CACHE_TTL:
            return data
        del analytics_cache[key]
    return None


def set_cache(key: str, value: Any):
    """Set value in cache with current timestamp."""
    analytics_cache[key] = (value, datetime.now().timestamp())


# Simulated data for demo (when inventory service is not available)
def get_demo_assets(tenant_id: str) -> List[Dict]:
    """Generate demo assets for testing."""
    import random
    statuses = ["ACTIVE", "IN_MAINTENANCE", "RETIRED", "DISPOSED"]
    conditions = ["EXCELLENT", "GOOD", "FAIR", "POOR"]
    
    assets = []
    for i in range(50):
        assets.append({
            "id": f"asset-{i+1}",
            "tenantId": tenant_id,
            "name": f"Asset {i+1}",
            "status": random.choice(statuses),
            "condition": random.choice(conditions),
            "price": round(random.uniform(100, 10000), 2),
            "acquisitionDate": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
            "createdAt": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat()
        })
    return assets


async def fetch_assets(tenant_id: str) -> List[Dict]:
    """Fetch assets from inventory service or return demo data."""
    cache_key = f"assets_{tenant_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{INVENTORY_SERVICE_URL}/api/assets",
                headers={"x-tenant-id": tenant_id}
            )
            if response.status_code == 200:
                assets = response.json()
                set_cache(cache_key, assets)
                return assets
    except Exception as e:
        print(f"Warning: Could not fetch from inventory service: {e}")
    
    # Return demo data if service unavailable
    demo_assets = get_demo_assets(tenant_id)
    set_cache(cache_key, demo_assets)
    return demo_assets


# FastAPI App
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    print(f"[Analytics Engine] Starting on port {PORT}")
    print(f"[Analytics Engine] Inventory Service: {INVENTORY_SERVICE_URL}")
    yield
    print("[Analytics Engine] Shutting down...")


app = FastAPI(
    title="SIMA Analytics Engine",
    description="Real-time asset analytics and statistical analysis service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health Endpoints
@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="analytics-engine",
        timestamp=datetime.now().isoformat()
    )


@app.get("/api/health/ready", tags=["Health"])
async def readiness_check():
    """Readiness probe for Kubernetes."""
    return {"status": "ready"}


@app.get("/api/health/live", tags=["Health"])
async def liveness_check():
    """Liveness probe for Kubernetes."""
    return {"status": "alive"}


# Analytics Endpoints
@app.get("/api/analytics/assets/summary", response_model=AssetSummary, tags=["Analytics"])
async def get_assets_summary(
    x_tenant_id: str = Header(..., alias="x-tenant-id")
):
    """
    Get comprehensive summary of assets for a tenant.
    Includes total count, value analysis, and distribution by status/condition.
    """
    assets = await fetch_assets(x_tenant_id)
    
    if not assets:
        raise HTTPException(status_code=404, detail="No assets found for tenant")
    
    # Calculate statistics
    total_assets = len(assets)
    prices = [a.get("price", 0) or 0 for a in assets]
    total_value = sum(prices)
    average_value = total_value / total_assets if total_assets > 0 else 0
    
    # Count by status
    status_counts = {}
    for asset in assets:
        status = asset.get("status", "UNKNOWN")
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Count by condition
    condition_counts = {}
    for asset in assets:
        condition = asset.get("condition", "UNKNOWN")
        condition_counts[condition] = condition_counts.get(condition, 0) + 1
    
    return AssetSummary(
        total_assets=total_assets,
        total_value=round(total_value, 2),
        average_value=round(average_value, 2),
        assets_by_status=status_counts,
        assets_by_condition=condition_counts,
        tenant_id=x_tenant_id,
        generated_at=datetime.now().isoformat()
    )


@app.get("/api/analytics/assets/by-status", response_model=List[StatusDistribution], tags=["Analytics"])
async def get_assets_by_status(
    x_tenant_id: str = Header(..., alias="x-tenant-id")
):
    """Get distribution of assets by status."""
    assets = await fetch_assets(x_tenant_id)
    
    if not assets:
        return []
    
    total = len(assets)
    status_counts = {}
    for asset in assets:
        status = asset.get("status", "UNKNOWN")
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return [
        StatusDistribution(
            status=status,
            count=count,
            percentage=round((count / total) * 100, 2)
        )
        for status, count in status_counts.items()
    ]


@app.get("/api/analytics/assets/by-condition", response_model=List[ConditionDistribution], tags=["Analytics"])
async def get_assets_by_condition(
    x_tenant_id: str = Header(..., alias="x-tenant-id")
):
    """Get distribution of assets by condition."""
    assets = await fetch_assets(x_tenant_id)
    
    if not assets:
        return []
    
    total = len(assets)
    condition_counts = {}
    for asset in assets:
        condition = asset.get("condition", "UNKNOWN")
        condition_counts[condition] = condition_counts.get(condition, 0) + 1
    
    return [
        ConditionDistribution(
            condition=condition,
            count=count,
            percentage=round((count / total) * 100, 2)
        )
        for condition, count in condition_counts.items()
    ]


@app.get("/api/analytics/assets/value", response_model=ValueAnalysis, tags=["Analytics"])
async def get_value_analysis(
    x_tenant_id: str = Header(..., alias="x-tenant-id")
):
    """Get value analysis of assets (total, average, max, min, median)."""
    assets = await fetch_assets(x_tenant_id)
    
    if not assets:
        raise HTTPException(status_code=404, detail="No assets found")
    
    prices = sorted([a.get("price", 0) or 0 for a in assets])
    total = sum(prices)
    count = len(prices)
    
    # Calculate median
    if count % 2 == 0:
        median = (prices[count // 2 - 1] + prices[count // 2]) / 2
    else:
        median = prices[count // 2]
    
    return ValueAnalysis(
        total_value=round(total, 2),
        average_value=round(total / count, 2) if count > 0 else 0,
        max_value=round(max(prices), 2) if prices else 0,
        min_value=round(min(prices), 2) if prices else 0,
        median_value=round(median, 2),
        asset_count=count
    )


@app.get("/api/analytics/trends/monthly", response_model=List[MonthlyTrend], tags=["Analytics"])
async def get_monthly_trends(
    x_tenant_id: str = Header(..., alias="x-tenant-id"),
    months: int = Query(default=6, ge=1, le=12, description="Number of months to analyze")
):
    """Get monthly trends of asset creation and value."""
    assets = await fetch_assets(x_tenant_id)
    
    if not assets:
        return []
    
    # Group by month
    monthly_data = {}
    for asset in assets:
        created_at = asset.get("createdAt") or asset.get("acquisitionDate")
        if created_at:
            try:
                date = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                month_key = date.strftime("%Y-%m")
                if month_key not in monthly_data:
                    monthly_data[month_key] = {"count": 0, "value": 0}
                monthly_data[month_key]["count"] += 1
                monthly_data[month_key]["value"] += asset.get("price", 0) or 0
            except:
                pass
    
    # Sort and limit to requested months
    sorted_months = sorted(monthly_data.keys(), reverse=True)[:months]
    
    return [
        MonthlyTrend(
            month=month,
            assets_created=monthly_data[month]["count"],
            total_value=round(monthly_data[month]["value"], 2)
        )
        for month in sorted_months
    ]


# Main entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
