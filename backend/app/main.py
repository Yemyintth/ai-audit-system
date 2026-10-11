from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import transactions, anomalies, dashboard, admin, audit, generation, explain, list_api, detection

app = FastAPI(title="AI Audit Risk Assessment API", version="7.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(anomalies.router, prefix="/api/anomalies", tags=["anomalies"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(audit.router, prefix="/api/audit", tags=["audit"])
app.include_router(generation.router, prefix="/api/generation", tags=["generation"])
app.include_router(explain.router, prefix="/api/explain", tags=["explain"])
app.include_router(list_api.router, prefix="/api/list", tags=["list"])
app.include_router(detection.router, prefix="/api/detection", tags=["detection"])

@app.get("/")
def root():
    return {"message": "AI Audit API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
