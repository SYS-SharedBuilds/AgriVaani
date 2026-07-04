import pytest
from scorer import score_crops, CROP_REQUIREMENTS

def test_score_crops_drought_scenario():
    # Scenario 1: Deep groundwater, dry season
    plot_data = {
        "soil_ph": 6.8,
        "groundwater_depth_m": 45.0
    }
    ranked = score_crops(plot_data, season="rabi")
    
    top_crop = ranked[0]["crop"]
    # We expect a low water requirement crop to win (e.g. moong or groundnut)
    assert CROP_REQUIREMENTS[top_crop]["water_req"] == "low"
    
    # Paddy should score poorly due to high water req + deep gw
    paddy = next(c for c in ranked if c["crop"] == "paddy")
    assert paddy["score"] < 1.0

def test_score_crops_acidic_soil():
    # Scenario 2: Acidic soil
    plot_data = {
        "soil_ph": 5.2,
        "groundwater_depth_m": 10.0
    }
    ranked = score_crops(plot_data, season="kharif")
    
    # Paddy is tolerant to acidic soil (5.0 - 6.5)
    # Cotton (5.8 - 8.0) is not, so it should be penalized
    paddy = next(c for c in ranked if c["crop"] == "paddy")
    cotton = next(c for c in ranked if c["crop"] == "cotton")
    
    assert paddy["score"] > cotton["score"]

def test_score_crops_optimal_cotton():
    # Scenario 3: Perfect for cotton
    plot_data = {
        "soil_ph": 6.5,
        "groundwater_depth_m": 15.0
    }
    ranked = score_crops(plot_data, season="kharif")
    
    cotton = next(c for c in ranked if c["crop"] == "cotton")
    # Cotton should get full score
    assert cotton["score"] == 1.0

def test_score_crops_high_ph():
    # Scenario 4: Alkaline soil
    plot_data = {
        "soil_ph": 8.0,
        "groundwater_depth_m": 20.0
    }
    ranked = score_crops(plot_data, season="kharif")
    
    # Paddy is highly penalized
    paddy = next(c for c in ranked if c["crop"] == "paddy")
    assert paddy["score"] < 1.0
    
    # Cotton is tolerant up to 8.0
    cotton = next(c for c in ranked if c["crop"] == "cotton")
    assert cotton["score"] >= paddy["score"]

def test_score_crops_missing_data():
    # Scenario 5: Missing data falls back to defaults (ph 6.5, gw 20)
    plot_data = {}
    ranked = score_crops(plot_data, season="kharif")
    
    assert len(ranked) == 5
    assert all(0 <= c["score"] <= 1.0 for c in ranked)
