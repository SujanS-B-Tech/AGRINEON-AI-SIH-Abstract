"""
AGRONEON Crop Recommendation Training Pipeline
Phase 4: Dataset → Cleaning → Preprocessing → Train/Test Split → Training → Evaluation → Save
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets", "crop_recommendation.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "crop_recommender.pkl")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")

FEATURE_COLUMNS = [
    "N", "P", "K", "temperature", "humidity", "ph",
    "rainfall", "water_availability_encoded", "season_encoded",
]

CROPS = [
    "rice", "maize", "chickpea", "kidneybeans", "pigeonpeas",
    "mothbeans", "mungbean", "blackgram", "lentil", "pomegranate",
    "banana", "mango", "grapes", "watermelon", "muskmelon",
    "apple", "orange", "papaya", "coconut", "cotton", "jute", "coffee",
]


def load_and_clean_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = df.dropna()
    df = df[df["label"].isin(CROPS)]
    return df


def preprocess(df: pd.DataFrame):
    le_water = LabelEncoder()
    le_season = LabelEncoder()

    water_map = {"Abundant": 3, "Moderate": 2, "Scarce": 1, "Rain-fed Only": 0}
    season_map = {"Kharif": 0, "Rabi": 1, "Zaid": 2}

    if "water_availability" in df.columns:
        df["water_availability_encoded"] = df["water_availability"].map(water_map).fillna(2)
    else:
        df["water_availability_encoded"] = 2

    if "season" in df.columns:
        df["season_encoded"] = df["season"].map(season_map).fillna(0)
    else:
        df["season_encoded"] = 0

    available_features = [c for c in FEATURE_COLUMNS if c in df.columns]
    X = df[available_features]
    y = df["label"]

    return X, y, available_features


def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)

    return model, accuracy, report, list(X.columns)


def save_model(model, accuracy, report, feature_names):
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump({"model": model, "feature_names": feature_names}, MODEL_PATH)
    metadata = {"accuracy": accuracy, "features": feature_names, "report": report, "crops": CROPS}
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Model saved to {MODEL_PATH}")
    print(f"Accuracy: {accuracy:.4f}")


def main():
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}")
        print("Run: python generate_dataset.py first")
        return

    print("Loading dataset...")
    df = load_and_clean_data(DATASET_PATH)
    print(f"Records: {len(df)}")

    print("Preprocessing...")
    X, y, feature_names = preprocess(df)

    print("Training Random Forest...")
    model, accuracy, report, feature_names = train_model(X, y)

    print("Saving model...")
    save_model(model, accuracy, report, feature_names)
    print("Done!")


if __name__ == "__main__":
    main()
