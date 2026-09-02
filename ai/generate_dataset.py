"""Generate synthetic crop recommendation dataset based on agricultural parameters."""
import os
import numpy as np
import pandas as pd

OUTPUT = os.path.join(os.path.dirname(__file__), "..", "datasets", "crop_recommendation.csv")

CROP_PROFILES = {
    "rice": {"N": (80, 120), "P": (30, 50), "K": (30, 50), "temp": (20, 32), "humidity": (70, 90), "ph": (5.5, 7.0), "rainfall": (150, 300)},
    "maize": {"N": (60, 100), "P": (25, 45), "K": (25, 45), "temp": (21, 27), "humidity": (50, 70), "ph": (5.8, 7.5), "rainfall": (60, 110)},
    "cotton": {"N": (80, 120), "P": (30, 50), "K": (40, 60), "temp": (25, 35), "humidity": (50, 70), "ph": (6.0, 8.0), "rainfall": (50, 100)},
    "tomato": {"N": (100, 150), "P": (40, 60), "K": (100, 150), "temp": (21, 27), "humidity": (60, 80), "ph": (6.0, 7.0), "rainfall": (60, 120)},
    "groundnut": {"N": (20, 40), "P": (30, 50), "K": (30, 50), "temp": (25, 30), "humidity": (50, 70), "ph": (6.0, 7.5), "rainfall": (50, 100)},
    "chickpea": {"N": (20, 40), "P": (30, 50), "K": (20, 40), "temp": (15, 25), "humidity": (40, 60), "ph": (6.0, 7.5), "rainfall": (40, 80)},
    "banana": {"N": (100, 200), "P": (40, 60), "K": (150, 250), "temp": (25, 30), "humidity": (70, 85), "ph": (6.0, 7.5), "rainfall": (100, 200)},
    "grapes": {"N": (50, 80), "P": (30, 50), "K": (80, 120), "temp": (15, 35), "humidity": (50, 70), "ph": (6.0, 7.0), "rainfall": (50, 100)},
    "watermelon": {"N": (60, 100), "P": (30, 50), "K": (50, 80), "temp": (25, 30), "humidity": (60, 80), "ph": (6.0, 7.0), "rainfall": (50, 100)},
    "coffee": {"N": (80, 120), "P": (30, 50), "K": (80, 120), "temp": (15, 28), "humidity": (70, 90), "ph": (5.0, 6.5), "rainfall": (150, 250)},
}

WATER_OPTIONS = ["Abundant", "Moderate", "Scarce", "Rain-fed Only"]
SEASONS = ["Kharif", "Rabi", "Zaid"]


def generate(n_per_crop=200):
    rows = []
    for crop, profile in CROP_PROFILES.items():
        for _ in range(n_per_crop):
            rows.append({
                "N": np.random.uniform(*profile["N"]),
                "P": np.random.uniform(*profile["P"]),
                "K": np.random.uniform(*profile["K"]),
                "temperature": np.random.uniform(*profile["temp"]),
                "humidity": np.random.uniform(*profile["humidity"]),
                "ph": np.random.uniform(*profile["ph"]),
                "rainfall": np.random.uniform(*profile["rainfall"]),
                "water_availability": np.random.choice(WATER_OPTIONS),
                "season": np.random.choice(SEASONS),
                "label": crop,
            })
    return pd.DataFrame(rows)


if __name__ == "__main__":
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    df = generate()
    df.to_csv(OUTPUT, index=False)
    print(f"Generated {len(df)} records → {OUTPUT}")
