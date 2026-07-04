from typing import List
from pydantic import BaseModel

class CropRecommendation(BaseModel):
    crop: str
    score: float
    rationale: str

class RecommendationResponse(BaseModel):
    plot_id: str
    season: str
    recommendations: List[CropRecommendation]
    localized_message: str

class SyncSatelliteResponse(BaseModel):
    status: str
    message: str
    updated_ndvi: float | None
    updated_ndmi: float | None
