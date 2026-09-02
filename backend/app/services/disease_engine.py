"""AGRONEON Disease Analysis Engine — rule-based crop disease identification."""

DISEASE_DATABASE = {
    "early_blight": {
        "disease": "Early Blight (Alternaria solani)",
        "confidence": 85,
        "crops": ["tomato", "potato", "eggplant"],
        "symptoms": [
            "Dark concentric rings on lower leaves",
            "Yellowing around spots",
            "Premature leaf drop",
            "Brown lesions on stems",
        ],
        "prevention": [
            "Use disease-free seeds",
            "Ensure proper plant spacing for airflow",
            "Avoid overhead irrigation",
            "Crop rotation with non-solanaceous crops",
            "Remove infected plant debris",
        ],
        "next_steps": [
            "Remove and destroy affected leaves",
            "Apply recommended fungicide per official label guidance",
            "Monitor spread over next 7 days",
            "Consult local KVK if symptoms worsen",
        ],
    },
    "late_blight": {
        "disease": "Late Blight (Phytophthora infestans)",
        "confidence": 82,
        "crops": ["tomato", "potato"],
        "symptoms": [
            "Water-soaked grey-green lesions on leaves",
            "White fungal growth on leaf undersides",
            "Rapid browning and death of foliage",
            "Brown rot on fruits/tubers",
        ],
        "prevention": [
            "Use resistant varieties",
            "Avoid planting during highly humid seasons",
            "Good drainage management",
            "Preventive fungicide application",
        ],
        "next_steps": [
            "Immediately remove heavily infected plants",
            "Apply copper-based fungicide",
            "Improve field drainage",
            "Consult nearest agricultural extension officer",
        ],
    },
    "powdery_mildew": {
        "disease": "Powdery Mildew",
        "confidence": 80,
        "crops": ["all"],
        "symptoms": [
            "White powdery coating on leaves",
            "Leaf curling and distortion",
            "Stunted plant growth",
            "Premature leaf fall",
        ],
        "prevention": [
            "Ensure adequate air circulation",
            "Avoid excessive nitrogen fertilization",
            "Use resistant varieties",
            "Avoid wetting foliage during irrigation",
        ],
        "next_steps": [
            "Apply sulfur-based or neem-based fungicide",
            "Remove severely affected leaves",
            "Increase plant spacing if possible",
            "Monitor neighboring plants",
        ],
    },
    "bacterial_wilt": {
        "disease": "Bacterial Wilt (Ralstonia solanacearum)",
        "confidence": 78,
        "crops": ["tomato", "potato", "eggplant", "banana"],
        "symptoms": [
            "Sudden wilting of plant despite adequate water",
            "Lower leaves wilt first",
            "Brown discoloration of vascular tissue",
            "Bacterial ooze from cut stem in water",
        ],
        "prevention": [
            "Use resistant varieties",
            "Crop rotation with non-host crops",
            "Improve soil drainage",
            "Avoid working with wet plants",
        ],
        "next_steps": [
            "Remove and destroy infected plants immediately",
            "Do not compost infected material",
            "Solarize soil before next planting",
            "Consult plant pathologist for confirmation",
        ],
    },
    "leaf_curl": {
        "disease": "Leaf Curl Virus",
        "confidence": 75,
        "crops": ["tomato", "cotton", "chili"],
        "symptoms": [
            "Upward curling of leaves",
            "Yellowing and stunting",
            "Reduced fruit size",
            "Whitefly presence on undersides",
        ],
        "prevention": [
            "Use virus-resistant varieties",
            "Control whitefly vector population",
            "Maintain weed-free field margins",
            "Use yellow sticky traps",
        ],
        "next_steps": [
            "Remove and destroy infected plants",
            "Apply neem-based insecticide for whitefly control",
            "Install yellow sticky traps",
            "Consult local KVK for region-specific advice",
        ],
    },
    "healthy": {
        "disease": "No Disease Detected — Plant Appears Healthy",
        "confidence": 70,
        "crops": ["all"],
        "symptoms": [
            "No visible symptoms of disease",
            "Healthy green foliage",
            "Normal growth pattern",
        ],
        "prevention": [
            "Continue regular monitoring",
            "Maintain proper nutrition schedule",
            "Practice preventive pest management",
            "Ensure proper irrigation",
        ],
        "next_steps": [
            "Continue current management practices",
            "Schedule next inspection in 7 days",
            "Monitor weather forecasts for disease-favorable conditions",
        ],
    },
}


def analyze_disease(filename: str = "", crop_name: str = "") -> dict:
    """
    Analyze uploaded image for crop disease.
    In production, this would use a trained CNN model.
    Currently uses rule-based heuristic based on filename hints and crop context.
    """
    fn = filename.lower()
    crop = crop_name.lower()

    # Try to match by filename keywords
    for key, disease in DISEASE_DATABASE.items():
        if key.replace("_", " ") in fn or key.replace("_", "") in fn:
            return disease

    # Match by common disease-crop combinations
    if crop in ["tomato", "potato"]:
        if any(kw in fn for kw in ["blight", "brown", "spot", "lesion"]):
            return DISEASE_DATABASE["early_blight"]
        if any(kw in fn for kw in ["wilt", "droopy"]):
            return DISEASE_DATABASE["bacterial_wilt"]
        if any(kw in fn for kw in ["curl", "yellow"]):
            return DISEASE_DATABASE["leaf_curl"]
        # Default for tomato/potato
        return DISEASE_DATABASE["early_blight"]

    if crop in ["cotton"]:
        if any(kw in fn for kw in ["curl", "yellow"]):
            return DISEASE_DATABASE["leaf_curl"]
        return DISEASE_DATABASE["powdery_mildew"]

    if any(kw in fn for kw in ["healthy", "green", "good"]):
        return DISEASE_DATABASE["healthy"]

    if any(kw in fn for kw in ["powder", "white", "mildew"]):
        return DISEASE_DATABASE["powdery_mildew"]

    # Default: return early blight as most common disease
    return DISEASE_DATABASE["early_blight"]
