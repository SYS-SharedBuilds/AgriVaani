from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import random
from datetime import datetime

from models import RecommendationResponse, SyncSatelliteResponse, CropRecommendation
from database import get_plot_data, save_recommendation
from scorer import score_crops
from gemini_client import generate_localized_rationale

app = FastAPI(title="AgriVaani Recommendation Service")

@app.get("/healthz")
def health_check():
    return {"status": "ok", "service": "recommendation-service"}

@app.get("/v1/plots/{plot_id}/recommendation", response_model=RecommendationResponse)
def get_recommendation(plot_id: str, season: str = "kharif"):
    # 1. Fetch plot and farmer data
    plot_data = get_plot_data(plot_id)
    if not plot_data:
        raise HTTPException(status_code=404, detail="Plot not found")
        
    language = plot_data.get("preferred_language", "hi")
    
    # 2. Score crops using rules-based engine
    ranked_crops_data = score_crops(plot_data, season)
    
    # 3. Generate localized rationale
    localized_message = generate_localized_rationale(ranked_crops_data, language)
    
    # 4. Save recommendation to DB
    save_recommendation(plot_id, season, ranked_crops_data)
    
    # 5. Return typed response
    recommendations = [CropRecommendation(**c) for c in ranked_crops_data]
    return RecommendationResponse(
        plot_id=plot_id,
        season=season,
        recommendations=recommendations,
        localized_message=localized_message
    )

@app.post("/v1/plots/{plot_id}/sync-satellite", response_model=SyncSatelliteResponse)
def sync_satellite(plot_id: str):
    """
    Mock Earth Engine integration.
    In a real scenario, this would query Google Earth Engine (Sentinel-2) for NDVI/NDMI.
    """
    plot_data = get_plot_data(plot_id)
    if not plot_data:
        raise HTTPException(status_code=404, detail="Plot not found")
        
    # Mocking Earth Engine API call
    updated_ndvi = round(random.uniform(0.2, 0.8), 2)
    updated_ndmi = round(random.uniform(-0.1, 0.5), 2)
    
    # Normally we would save this back to the plots table
    import psycopg2
    from database import get_db_connection
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE plots 
                SET ndvi_value = %s, ndmi_value = %s, last_satellite_sync = %s
                WHERE id = %s
            """, (updated_ndvi, updated_ndmi, datetime.now(), plot_id))
            conn.commit()
    except Exception as e:
        print(f"DB Update Error: {e}")
    
    return SyncSatelliteResponse(
        status="success",
        message=f"Successfully synced Earth Engine data for plot {plot_id}",
        updated_ndvi=updated_ndvi,
        updated_ndmi=updated_ndmi
    )

# Generic exception handler for typed errors
@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": str(exc)}}
    )
