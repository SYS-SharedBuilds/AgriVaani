CROP_REQUIREMENTS = {
    "cotton": {"ph_min": 5.8, "ph_max": 8.0, "water_req": "high"},
    "moong": {"ph_min": 6.2, "ph_max": 7.2, "water_req": "low"},
    "maize": {"ph_min": 5.5, "ph_max": 7.5, "water_req": "medium"},
    "groundnut": {"ph_min": 6.0, "ph_max": 6.5, "water_req": "low"},
    "paddy": {"ph_min": 5.0, "ph_max": 6.5, "water_req": "very_high"}
}

def score_crops(plot_data: dict, season: str):
    """
    Rules-based scoring function as a fallback to XGBoost.
    Returns ranked list of crops with score and rationale.
    """
    ph = plot_data.get("soil_ph") or 6.5
    gw_depth = plot_data.get("groundwater_depth_m") or 20.0
    
    # Simple proxy for rainfall normals
    is_dry_season = season.lower() in ["rabi", "zaid"]
    
    scored_crops = []
    
    for crop, req in CROP_REQUIREMENTS.items():
        score = 1.0
        rationale = []
        
        # pH constraint
        if ph < req["ph_min"] or ph > req["ph_max"]:
            score -= 0.3
            rationale.append(f"Soil pH ({ph}) is outside optimal range ({req['ph_min']}-{req['ph_max']}).")
        else:
            rationale.append(f"Soil pH ({ph}) is optimal.")
            
        # Water/Rainfall constraint
        if req["water_req"] in ["high", "very_high"]:
            if gw_depth > 30.0:
                score -= 0.4
                rationale.append(f"Groundwater is too deep ({gw_depth}m) for high water requirement.")
            elif is_dry_season:
                score -= 0.3
                rationale.append("Dry season may not support high water requirement without heavy irrigation.")
            else:
                rationale.append("Sufficient water availability expected.")
        elif req["water_req"] == "low":
            if gw_depth > 30.0 or is_dry_season:
                score += 0.1
                rationale.append("Good choice for deep groundwater or dry season due to low water requirement.")
            else:
                rationale.append("Low water requirement crop.")
                
        # Cap score between 0 and 1
        score = max(0.0, min(1.0, score))
        
        scored_crops.append({
            "crop": crop,
            "score": round(score, 2),
            "rationale": " ".join(rationale)
        })
        
    # Sort by score descending
    scored_crops.sort(key=lambda x: x["score"], reverse=True)
    return scored_crops[:5]
