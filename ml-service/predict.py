from __future__ import annotations

import pickle
from pathlib import Path
from typing import Any, Dict, Optional

import pandas as pd

from features import CATEGORICAL_FEATURES, FEATURE_COLUMNS, NON_NEGATIVE_NUMERIC

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "trained_models" / "price_model.pkl"
LOWER_MODEL_PATH = BASE_DIR / "trained_models" / "price_model_lower.pkl"
UPPER_MODEL_PATH = BASE_DIR / "trained_models" / "price_model_upper.pkl"
FEATURE_PATH = BASE_DIR / "trained_models" / "feature_columns.pkl"

CURRENT_YEAR = pd.Timestamp.now().year

TITLE_CASE_COLS = [
    "brand", "model", "variant", "city", "state", "fuel_type",
    "transmission_type", "body_type", "seller_type", "listing_type",
    "color", "steering_type", "front_brake_type", "rear_brake_type",
    "tyre_type", "fuel_supply_system",
]

DRIVE_TYPE_MAP = {
    "two wheel drive": "2WD", "2wd": "2WD",
    "front wheel drive": "FWD", "fwd": "FWD",
    "rear wheel drive": "RWD", "rwd": "RWD",
    "four wheel drive": "4WD", "4wd": "4WD",
    "all wheel drive": "AWD", "awd": "AWD",
}

REQUEST_FIELD_ALIASES = {
    "kmDriven": "km_driven",
    "fuelType": "fuel_type",
    "transmission": "transmission_type",
    "bodyType": "body_type",
    "sellerType": "seller_type",
}

_ARTIFACTS: Optional[dict] = None


class ModelArtifactsError(FileNotFoundError):
    """Raised when trained model files are missing on disk."""


def _load_artifacts() -> dict:
    global _ARTIFACTS
    if _ARTIFACTS is not None:
        return _ARTIFACTS

    required_paths = [MODEL_PATH, LOWER_MODEL_PATH, UPPER_MODEL_PATH]
    missing = [str(path) for path in required_paths if not path.exists()]
    if missing:
        raise ModelArtifactsError(
            "Missing trained model files: "
            + ", ".join(missing)
            + ". Run `python train_price_model.py` from the ml-service directory."
        )

    with open(MODEL_PATH, "rb") as file:
        point_model = pickle.load(file)
    with open(LOWER_MODEL_PATH, "rb") as file:
        lower_model = pickle.load(file)
    with open(UPPER_MODEL_PATH, "rb") as file:
        upper_model = pickle.load(file)

    if FEATURE_PATH.exists():
        with open(FEATURE_PATH, "rb") as file:
            feature_columns = pickle.load(file)
    else:
        feature_columns = FEATURE_COLUMNS
        FEATURE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(FEATURE_PATH, "wb") as file:
            pickle.dump(FEATURE_COLUMNS, file)

    _ARTIFACTS = {
        "point_model": point_model,
        "lower_model": lower_model,
        "upper_model": upper_model,
        "feature_columns": feature_columns,
    }
    return _ARTIFACTS


def map_request_to_features(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize API / listing payloads into the model's feature schema."""
    data: Dict[str, Any] = {}

    for key, value in payload.items():
        if value is None or value == "":
            continue
        mapped_key = REQUEST_FIELD_ALIASES.get(key, key)
        data[mapped_key] = value

    if "year" in data and "car_age" not in data:
        data["car_age"] = CURRENT_YEAR - int(data.pop("year"))

    return data


def validate_vehicle_data(vehicle_data: Dict[str, Any]) -> None:
    errors: list[str] = []

    for field in NON_NEGATIVE_NUMERIC:
        value = vehicle_data.get(field)
        if value is None:
            continue
        try:
            numeric_value = float(value)
        except (TypeError, ValueError):
            errors.append(f"{field} must be numeric")
            continue
        if numeric_value < 0:
            errors.append(f"{field} must be >= 0")

    if vehicle_data.get("car_age") is not None:
        car_age = int(vehicle_data["car_age"])
        if car_age < 0 or car_age > 50:
            errors.append("car_age must be between 0 and 50")

    if errors:
        raise ValueError("; ".join(errors))


def _standardize_inputs(vehicle_data: dict) -> dict:
    """Apply the same categorical cleanup used during training."""
    cleaned = dict(vehicle_data)

    for col in TITLE_CASE_COLS:
        if cleaned.get(col) is not None:
            cleaned[col] = str(cleaned[col]).strip().title()

    if cleaned.get("drive_type") is not None:
        key = str(cleaned["drive_type"]).strip().lower()
        cleaned["drive_type"] = DRIVE_TYPE_MAP.get(
            key, str(cleaned["drive_type"]).strip().upper()
        )

    if cleaned.get("value_configuration") is not None:
        cleaned["value_configuration"] = str(cleaned["value_configuration"]).strip().upper()

    brand = cleaned.get("brand")
    model = cleaned.get("model")
    if brand and model and not str(model).lower().startswith(str(brand).lower()):
        cleaned["model"] = f"{brand} {model}"

    return cleaned


def _extract_categorical_base(encoded_name: str) -> str:
    for feature in sorted(CATEGORICAL_FEATURES, key=len, reverse=True):
        if encoded_name == feature or encoded_name.startswith(f"{feature}_"):
            return feature
    return encoded_name.split("_")[0]


def get_feature_importance(top_n: int = 8) -> Dict[str, float]:
    artifacts = _load_artifacts()
    model = artifacts["point_model"].named_steps["model"]
    if not hasattr(model, "feature_importances_"):
        return {}

    preprocessor = artifacts["point_model"].named_steps["preprocessor"]
    try:
        encoded_names = list(preprocessor.get_feature_names_out())
    except Exception:
        return {}

    aggregated: Dict[str, float] = {}
    for name, importance in zip(encoded_names, model.feature_importances_):
        if name.startswith("num__"):
            base = name.removeprefix("num__")
        elif name.startswith("cat__"):
            base = _extract_categorical_base(name.removeprefix("cat__"))
        else:
            base = name
        aggregated[base] = aggregated.get(base, 0.0) + float(importance)

    total = sum(aggregated.values()) or 1.0
    normalized = {key: round(value / total, 4) for key, value in aggregated.items()}
    return dict(sorted(normalized.items(), key=lambda item: item[1], reverse=True)[:top_n])


def _confidence_level(low: float, predicted: float, high: float) -> str:
    width_ratio = (high - low) / max(predicted, 1.0)
    if width_ratio < 0.15:
        return "high"
    if width_ratio < 0.30:
        return "medium"
    return "low"


def predict_price(vehicle_data: dict) -> dict:
    """
    Predict a used car's price as a range.

    Returns
    -------
    dict
        {"low": float, "predicted": float, "high": float}
    """
    artifacts = _load_artifacts()
    cleaned = _standardize_inputs(vehicle_data)

    df = pd.DataFrame([cleaned]).reindex(
        columns=artifacts["feature_columns"], fill_value=None
    )

    point = float(artifacts["point_model"].predict(df)[0])
    low = float(artifacts["lower_model"].predict(df)[0])
    high = float(artifacts["upper_model"].predict(df)[0])

    low, point, high = sorted([low, point, high])

    return {
        "low": round(low, 2),
        "predicted": round(point, 2),
        "high": round(high, 2),
    }


def predict_price_for_api(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Predict price using the Valora ML API response schema."""
    mapped = map_request_to_features(payload)
    validate_vehicle_data(mapped)

    if not mapped.get("brand") or not mapped.get("model"):
        raise ValueError("brand and model are required")

    if mapped.get("car_age") is None and mapped.get("km_driven") is None:
        raise ValueError("Provide either year or car_age, and ideally km_driven")

    result = predict_price(mapped)

    return {
        "predicted_price_min": result["low"],
        "predicted_price_max": result["high"],
        "predicted_price": result["predicted"],
        "confidence_level": _confidence_level(result["low"], result["predicted"], result["high"]),
        "feature_importance": get_feature_importance(),
    }


if __name__ == "__main__":
    sample_vehicle = {
        "car_age": 5,
        "km_driven": 40000,
        "engine_cc": 1197,
        "cylinders": 4,
        "power_bhp": 82,
        "mileage_kmpl": 18,
        "brand": "Maruti",
        "model": "Swift",
        "variant": "VXI",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "fuel_type": "Petrol",
        "transmission_type": "Manual",
        "body_type": "Hatchback",
        "seller_type": "Individual",
    }

    api_result = predict_price_for_api(sample_vehicle)
    print(
        f"Predicted Price: Rs.{api_result['predicted_price']:,.0f} "
        f"(range Rs.{api_result['predicted_price_min']:,.0f} - "
        f"Rs.{api_result['predicted_price_max']:,.0f}, "
        f"confidence={api_result['confidence_level']})"
    )
