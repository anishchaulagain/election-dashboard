from fastapi import APIRouter, HTTPException
from services.polling_service import fetch_and_store_all

router = APIRouter(prefix="/api/polling", tags=["polling"])

@router.get("/sync")
async def sync_data():
    """Manually trigger a data synchronization from external APIs."""
    results = await fetch_and_store_all()
    if not results.get("success", False):
        raise HTTPException(status_code=500, detail=results.get("error", "Failed to sync data"))
    return results
