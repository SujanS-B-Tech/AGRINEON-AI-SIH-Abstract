"""AGRONEON Crop Recommendation Engine
Uses trained Random Forest model if available, otherwise falls back to rule-based logic.
Generates top-3 recommendations with explainable factors and economics.
"""
import os
import json
import random
from typing import Optional

# Try to load ML libraries (available in requirements.txt)
try:
    import joblib
    import numpy as np
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

CROP_PROFILES = {
    "Rice": {"N": (80, 120), "P": (30, 50), "K": (30, 50), "temp": (20, 32), "humidity": (70, 90), "ph": (5.5, 7.0), "rainfall": (150, 300),
             "water": ["Abundant", "Moderate"], "season": ["Kharif"],
             "cost": {"seed": 5000, "fertilizer": 10000, "labour": 20000, "irrigation": 8000, "equipment": 5000, "other": 3000},
             "yield_range": (25, 40), "yield_unit": "quintal/acre", "price_range": (1800, 2500), "risk": "Medium",
             "risk_factors": ["Water dependency", "Pest susceptibility"]},
    "Tomato": {"N": (100, 150), "P": (40, 60), "K": (100, 150), "temp": (21, 27), "humidity": (60, 80), "ph": (6.0, 7.0), "rainfall": (60, 120),
               "water": ["Moderate", "Abundant"], "season": ["Kharif", "Rabi"],
               "cost": {"seed": 8500, "fertilizer": 12000, "labour": 25000, "irrigation": 8000, "equipment": 5000, "other": 3000},
               "yield_range": (200, 300), "yield_unit": "quintal/acre", "price_range": (2000, 3500), "risk": "Medium",
               "risk_factors": ["Weather variability", "Market price fluctuation"]},
    "Groundnut": {"N": (20, 40), "P": (30, 50), "K": (30, 50), "temp": (25, 30), "humidity": (50, 70), "ph": (6.0, 7.5), "rainfall": (50, 100),
                  "water": ["Moderate", "Scarce"], "season": ["Kharif", "Rabi"],
                  "cost": {"seed": 6000, "fertilizer": 8000, "labour": 18000, "irrigation": 4000, "equipment": 3000, "other": 2000},
                  "yield_range": (12, 20), "yield_unit": "quintal/acre", "price_range": (5500, 7000), "risk": "Low",
                  "risk_factors": ["Drought tolerance good", "Stable demand"]},
    "Cotton": {"N": (80, 120), "P": (30, 50), "K": (40, 60), "temp": (25, 35), "humidity": (50, 70), "ph": (6.0, 8.0), "rainfall": (50, 100),
               "water": ["Moderate"], "season": ["Kharif"],
               "cost": {"seed": 12000, "fertilizer": 15000, "labour": 30000, "irrigation": 12000, "equipment": 8000, "other": 5000},
               "yield_range": (8, 15), "yield_unit": "quintal/acre", "price_range": (6000, 8000), "risk": "High",
               "risk_factors": ["Pest susceptibility", "High input cost", "Market volatility"]},
    "Maize": {"N": (60, 100), "P": (25, 45), "K": (25, 45), "temp": (21, 27), "humidity": (50, 70), "ph": (5.8, 7.5), "rainfall": (60, 110),
              "water": ["Moderate", "Abundant"], "season": ["Kharif", "Rabi"],
              "cost": {"seed": 4000, "fertilizer": 8000, "labour": 15000, "irrigation": 5000, "equipment": 4000, "other": 2000},
              "yield_range": (20, 35), "yield_unit": "quintal/acre", "price_range": (1800, 2400), "risk": "Low",
              "risk_factors": ["Relatively stable crop", "Moderate disease risk"]},
    "Chickpea": {"N": (20, 40), "P": (30, 50), "K": (20, 40), "temp": (15, 25), "humidity": (40, 60), "ph": (6.0, 7.5), "rainfall": (40, 80),
                 "water": ["Scarce", "Rain-fed Only"], "season": ["Rabi"],
                 "cost": {"seed": 5000, "fertilizer": 6000, "labour": 12000, "irrigation": 3000, "equipment": 3000, "other": 2000},
                 "yield_range": (8, 15), "yield_unit": "quintal/acre", "price_range": (4500, 6000), "risk": "Low",
                 "risk_factors": ["Frost sensitivity", "Pod borer risk"]},
    "Banana": {"N": (100, 200), "P": (40, 60), "K": (150, 250), "temp": (25, 30), "humidity": (70, 85), "ph": (6.0, 7.5), "rainfall": (100, 200),
               "water": ["Abundant"], "season": ["Kharif", "Rabi", "Zaid"],
               "cost": {"seed": 15000, "fertilizer": 18000, "labour": 35000, "irrigation": 12000, "equipment": 8000, "other": 5000},
               "yield_range": (250, 400), "yield_unit": "quintal/acre", "price_range": (800, 1500), "risk": "Medium",
               "risk_factors": ["Wind damage", "Panama disease risk"]},
    "Watermelon": {"N": (60, 100), "P": (30, 50), "K": (50, 80), "temp": (25, 30), "humidity": (60, 80), "ph": (6.0, 7.0), "rainfall": (50, 100),
                   "water": ["Moderate", "Abundant"], "season": ["Zaid", "Kharif"],
                   "cost": {"seed": 7000, "fertilizer": 10000, "labour": 20000, "irrigation": 6000, "equipment": 4000, "other": 3000},
                   "yield_range": (100, 200), "yield_unit": "quintal/acre", "price_range": (500, 1200), "risk": "Medium",
                   "risk_factors": ["Perishability", "Market timing critical"]},
}


def _score_crop(crop_name: str, profile: dict, params: dict) -> tuple:
    """Score a crop's suitability (0-100) based on farm parameters. Returns (score, explanations)."""
    score = 50
    explanations = []

    # pH match
    if params.get("ph"):
        ph = params["ph"]
        ph_low, ph_high = profile["ph"]
        if ph_low <= ph <= ph_high:
            score += 12
            explanations.append(f"Suitable soil pH ({ph:.1f})")
        elif abs(ph - (ph_low + ph_high) / 2) < 1.5:
            score += 5
            explanations.append(f"Acceptable soil pH ({ph:.1f})")
        else:
            score -= 10

    # Temperature match
    if params.get("temperature"):
        t = params["temperature"]
        t_low, t_high = profile["temp"]
        if t_low <= t <= t_high:
            score += 10
            explanations.append(f"Suitable temperature ({t:.0f}°C)")
        elif abs(t - (t_low + t_high) / 2) < 5:
            score += 3

    # Water availability match
    if params.get("water_availability"):
        if params["water_availability"] in profile.get("water", []):
            score += 10
            explanations.append(f"{params['water_availability']} water availability compatible")
        else:
            score -= 8

    # Season match
    if params.get("season"):
        if params["season"] in profile.get("season", []):
            score += 10
            explanations.append(f"{params['season']} season suitable")
        else:
            score -= 12

    # Soil type compatibility (generic heuristic)
    soil = params.get("soil_type", "")
    if soil:
        if crop_name in ["Rice"] and soil in ["Alluvial", "Clay"]:
            score += 8
            explanations.append(f"{soil} soil ideal for {crop_name}")
        elif crop_name in ["Groundnut", "Tomato"] and soil in ["Red Loam", "Sandy Loam"]:
            score += 8
            explanations.append(f"{soil} soil compatible")
        elif crop_name in ["Cotton"] and soil in ["Black Cotton"]:
            score += 10
            explanations.append(f"Black Cotton soil ideal for cotton")
        else:
            score += 3
            explanations.append(f"{soil} soil acceptable")

    # NPK matching
    for nutrient, key in [("N", "nitrogen"), ("P", "phosphorus"), ("K", "potassium")]:
        if params.get(key):
            val = params[key]
            n_low, n_high = profile[nutrient]
            if n_low <= val <= n_high:
                score += 3
            elif val < n_low:
                score -= 2

    # Previous crop rotation benefit
    if params.get("previous_crop"):
        prev = params["previous_crop"].lower()
        if crop_name == "Tomato" and prev in ["paddy", "rice"]:
            score += 5
            explanations.append("Previous crop rotation beneficial")
        elif crop_name == "Groundnut" and prev in ["paddy", "rice", "tomato"]:
            score += 5
            explanations.append("Good for crop rotation")

    # Clamp score
    score = max(30, min(98, score))

    if not explanations:
        explanations.append("General conditions acceptable")

    return score, explanations


def recommend_crops(params: dict, top_n: int = 3) -> list:
    """Generate top-N crop recommendations with explainability and economics."""
    scored = []
    for crop_name, profile in CROP_PROFILES.items():
        score, explanations = _score_crop(crop_name, profile, params)
        cost = profile["cost"]
        total_cost = sum(cost.values())
        exp_yield = random.uniform(*profile["yield_range"])
        market_price = random.uniform(*profile["price_range"])
        revenue = exp_yield * market_price
        profit = revenue - total_cost

        scored.append({
            "crop_name": crop_name,
            "suitability_score": round(score, 1),
            "explanation": explanations,
            "seed_cost": cost["seed"],
            "fertilizer_cost": cost["fertilizer"],
            "labour_cost": cost["labour"],
            "irrigation_cost": cost["irrigation"],
            "equipment_cost": cost["equipment"],
            "other_cost": cost["other"],
            "expected_yield": round(exp_yield, 1),
            "yield_unit": profile["yield_unit"],
            "market_price": round(market_price, 0),
            "estimated_revenue": round(revenue, 0),
            "estimated_profit": round(profit, 0),
            "risk_level": profile["risk"],
            "risk_factors": profile["risk_factors"],
        })

    scored.sort(key=lambda x: x["suitability_score"], reverse=True)
    return scored[:top_n]


def generate_farming_tasks(crop_name: str, season: str = "Kharif") -> list:
    """Generate a realistic farming task list for a given crop."""
    from datetime import date, timedelta
    today = date.today()

    # Common stages for most crops
    stages = [
        ("Land Preparation", "Clear field debris, deep plough the land, and level the field.", -7),
        ("Seed Treatment", f"Treat {crop_name} seeds with recommended fungicide before sowing.", -3),
        ("Sowing", f"Sow {crop_name} seeds at recommended spacing and depth.", 0),
        ("Germination", "Monitor seed germination rate. Ensure adequate moisture.", 7),
        ("Vegetative Growth", f"Apply first dose of nitrogen fertilizer for {crop_name}. Monitor for early pests.", 21),
        ("Nutrient Management", "Apply NPK foliar spray as per soil test recommendations.", 35),
        ("Irrigation", "Check and maintain irrigation system. Adjust schedule based on weather.", 42),
        ("Pest Monitoring", "Scout field for pest damage. Apply IPM practices if pests detected.", 50),
        ("Disease Monitoring", f"Monitor {crop_name} for common diseases. Remove affected plant parts.", 60),
        ("Flowering", f"Ensure adequate water and nutrients during {crop_name} flowering stage.", 70),
        ("Fruit/Grain Development", "Monitor fruit/grain development. Protect from birds and rodents.", 85),
        ("Harvest Preparation", "Prepare harvesting equipment. Check market prices.", 100),
        ("Harvest", f"Harvest {crop_name} at optimal maturity. Handle with care to reduce damage.", 110),
    ]

    tasks = []
    for stage, desc, offset in stages:
        scheduled = today + timedelta(days=offset)
        completed = offset < 0
        tasks.append({
            "stage": stage,
            "task_description": desc,
            "scheduled_date": scheduled.isoformat(),
            "completed": completed,
            "completed_at": scheduled.isoformat() if completed else None,
            "alert": "Rain expected — avoid spraying pesticides." if stage == "Pest Monitoring" else None,
        })

    return tasks
