"""AGRONEON Disease Analysis Engine — Real ML Inference Pipeline."""
import os
import json
import logging
from PIL import Image

try:
    from transformers import pipeline
    from transformers.utils import logging as hf_logging
    hf_logging.set_verbosity_error()
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    logging.warning("Transformers library missing. Fallback mode active.")

# ---------------------------------------------------------
# ML MODEL INITIALIZATION (Loaded Once & Cached Locally)
# ---------------------------------------------------------
DISEASE_MODEL_ID = "dima806/plant-disease-detection"
MODEL_PIPELINE = None

def get_ml_pipeline():
    global MODEL_PIPELINE
    if not ML_AVAILABLE:
        return None
    if MODEL_PIPELINE is None:
        try:
            print(f"Loading/Caching ML Model: {DISEASE_MODEL_ID}")
            # This downloads and caches to ~/.cache/huggingface on first run
            MODEL_PIPELINE = pipeline(
                "image-classification", 
                model=DISEASE_MODEL_ID, 
                device=-1 # CPU by default, prevents GPU memory crashes in unconfigured envs
            )
        except Exception as e:
            logging.error(f"Failed to load ML Model: {e}")
            MODEL_PIPELINE = None
    return MODEL_PIPELINE

DISEASE_CONFIDENCE_THRESHOLD = 0.75

# ---------------------------------------------------------
# KNOWLEDGE GRAPH (ICAR/KVK-Level Grounded Data)
# ---------------------------------------------------------
# Translates standard PlantVillage labels into actionable, verified knowledge
KNOWLEDGE_BASE = {
    "Tomato___Early_blight": {
        "disease": "Early Blight (Alternaria solani)",
        "symptoms": [
            "Dark concentric rings on lower leaves",
            "Yellowing around visible spots",
            "Premature leaf senescence and drop",
            "Brown lesions on lower stems"
        ],
        "prevention": [
            "Use certified disease-free seeds",
            "Maintain 2-3 year crop rotation away from solanaceous plants",
            "Ensure proper plant spacing for improved airflow",
            "Avoid overhead irrigation to keep leaves dry"
        ],
        "management": [
            "Immediately remove and destroy affected lower leaves",
            "Improve field drainage if soil is waterlogged",
            "Apply mulch to prevent soil splashing onto leaves"
        ],
        "crop_protection": [
            "Active Ingredient: Mancozeb 75% WP or Chlorothalonil",
            "Usage: Apply as preventive spray before conditions become highly humid",
            "Warning: Wait 7 days after application before harvesting"
        ],
        "sources": ["ICAR Crop Management Guidelines", "State Agricultural Extension"]
    },
    "Tomato___Late_blight": {
        "disease": "Late Blight (Phytophthora infestans)",
        "symptoms": [
            "Water-soaked, pale-green to brown lesions on leaves",
            "White fungal-like growth on the underside of affected leaves",
            "Rapid collapse of foliage during humid conditions"
        ],
        "prevention": [
            "Employ resistant tomato cultivars",
            "Routinely monitor during cool, wet periods",
            "Ensure proper row orientation for prevailing winds"
        ],
        "management": [
            "Cull and aggressively destroy infected plants",
            "Halt all overhead watering immediately"
        ],
        "crop_protection": [
            "Active Ingredient: Copper Oxychloride 50% WP or Cymoxanil combinations",
            "Usage: Immediate curative application upon first symptom detection",
            "Warning: Highly contagious; treat nearby visually healthy plants preventively"
        ],
        "sources": ["National Plant Pathology Archives"]
    },
    "Apple___Apple_scab": {
        "disease": "Apple Scab (Venturia inaequalis)",
        "symptoms": [
            "Olive-green to black scaly lesions on leaves",
            "Cork-like scabs on fruit surface",
            "Yellowing and premature dropping of infected leaves"
        ],
        "prevention": [
            "Rake and destroy fallen leaves in autumn",
            "Prune canopy for adequate light and air penetration",
            "Select scab-resistant apple varieties"
        ],
        "management": [
            "Apply urea to fallen autumn leaves to speed decomposition",
            "Use protective fungicides from bud break through fruit set"
        ],
        "crop_protection": [
            "Active Ingredient: Captan or Myclobutanil",
            "Usage: Spray according to local extension degree-day models",
        ],
        "sources": ["State Horticulture Department"]
    },
    # General fallback for detected but unmapped PlantVillage classes
    "UNKNOWN_MAPPED_DISEASE": {
        "disease": "Detected Ailment (Needs Verification)",
        "symptoms": ["Visible stress or lesions on plant tissue"],
        "prevention": ["Maintain standard agricultural sanitation and crop rotation protocols"],
        "management": ["Isolate affected plants and monitor progression"],
        "crop_protection": ["Specific chemical treatment information could not be verified. Please consult the appropriate agricultural authority or official product label."],
        "sources": ["General Plant Health Guidelines"]
    }
}


def analyze_disease(image_path: str, crop_context: str = "unknown") -> dict:
    """
    Perform REAL ML inference using a Hugging Face pipeline.
    Connects the model score to verified agricultural knowledge.
    """
    pipe = get_ml_pipeline()
    
    if not pipe:
        # Failsafe if libraries/internet completely fail, maintaining honest reporting
        return {
            "prediction": "Model Unavailable",
            "model_score": 0.0,
            "confidence_level": "low",
            "severity": "Unknown",
            "disease_name": "Inference Engine Unavailable",
            "symptoms": [],
            "prevention": [],
            "next_steps": ["Consult agricultural expert manually - AI system is offline"],
            "crop_protection": [],
            "sources": []
        }

    try:
        # Load real image
        image = Image.open(image_path).convert("RGB")
        
        # Run inference (returns top 3 by default depending on pipeline)
        results = pipe(image)
        
        if not results:
            raise ValueError("No prediction returned from model.")

        top_pred = results[0]
        raw_label = top_pred["label"]
        model_score = float(top_pred.get("score", 0.0))
        
        # Determine confidence level strictly based on threshold
        if model_score >= DISEASE_CONFIDENCE_THRESHOLD:
            confidence_level = "high"
            severity = "Moderate to High" # Heuristic mapping for confirmed diseases
        elif model_score >= 0.50:
            confidence_level = "medium"
            severity = "Assess Manually"
        else:
            confidence_level = "low"
            severity = "Unknown"

        # Check if it's healthy
        if "healthy" in raw_label.lower():
            return {
                "prediction": raw_label,
                "model_score": model_score,
                "confidence_level": confidence_level,
                "severity": "None",
                "disease_name": "No Disease Detected (Appears Healthy)",
                "symptoms": ["No visible disease patterns recognized."],
                "prevention": ["Continue regular scheduled maintenance and monitoring."],
                "next_steps": ["Proceed with existing farming plan."],
                "crop_protection": ["None required."],
                "sources": ["AGRONEON AI"]
            }

        # Handle Low Confidence explicitly as requested by SIH requirements
        if confidence_level == "low":
            return {
                "prediction": raw_label,
                "model_score": model_score,
                "confidence_level": confidence_level,
                "severity": "Unknown",
                "disease_name": f"Possible: {raw_label.replace('___',' ').replace('_',' ')}",
                "symptoms": ["Image does not clearly show conclusive definitive symptoms."],
                "prevention": ["Upload a clearer image focusing on the affected area."],
                "next_steps": ["Upload a clearer image or consult an agricultural expert. The available evidence is insufficient for a reliable diagnosis."],
                "crop_protection": ["Specific chemical treatment information could not be verified. Do not apply chemicals without expert consultation."],
                "sources": []
            }

        # Knowledge mapping
        knowledge = KNOWLEDGE_BASE.get(raw_label, KNOWLEDGE_BASE["UNKNOWN_MAPPED_DISEASE"])
        
        display_name = knowledge.get("disease", raw_label.replace('___',' ').replace('_',' '))

        # Construct final structured explanation
        return {
            "prediction": raw_label,
            "model_score": model_score,
            "confidence_level": confidence_level,
            "severity": severity,
            "disease_name": display_name,
            "symptoms": knowledge.get("symptoms", []),
            "prevention": knowledge.get("prevention", []),
            "next_steps": knowledge.get("management", []),
            "crop_protection": knowledge.get("crop_protection", []),
            "sources": knowledge.get("sources", [])
        }

    except Exception as e:
        logging.error(f"Inference Failure: {e}")
        return {
            "prediction": "Error",
            "model_score": 0.0,
            "confidence_level": "low",
            "severity": "Unknown",
            "disease_name": "Analysis Failed",
            "symptoms": [],
            "prevention": [],
            "next_steps": ["System encountered an error processing the image."],
            "crop_protection": [],
            "sources": []
        }
