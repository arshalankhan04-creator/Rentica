"""
Valora ML Service — FastAPI HTTP wrapper around the price prediction module.

Run locally:
    uvicorn app:app --reload --port 8001
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from features import FEATURE_COLUMNS
from predict import ModelArtifactsError, predict_price_for_api

app = FastAPI(
    title="Valora ML Service",
    description="Used vehicle price prediction API for the Valora marketplace.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:5000,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictPriceRequest(BaseModel):
    brand: str
    model: str
    year: Optional[int] = None
    car_age: Optional[int] = None
    km_driven: Optional[float] = Field(default=None, alias="kmDriven")
    fuel_type: Optional[str] = Field(default=None, alias="fuelType")
    transmission: Optional[str] = None
    transmission_type: Optional[str] = None
    body_type: Optional[str] = Field(default=None, alias="bodyType")
    seller_type: Optional[str] = Field(default=None, alias="sellerType")
    city: Optional[str] = None
    state: Optional[str] = None
    variant: Optional[str] = None
    engine_cc: Optional[float] = None
    power_bhp: Optional[float] = None
    mileage_kmpl: Optional[float] = None

    model_config = ConfigDict(populate_by_name=True, extra="allow")


class PredictPriceResponse(BaseModel):
    predicted_price_min: float
    predicted_price_max: float
    predicted_price: float
    confidence_level: str
    feature_importance: Dict[str, float]


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "valora-ml"}


@app.get("/api/ml/features/")
def list_features() -> Dict[str, Any]:
    return {
        "feature_columns": FEATURE_COLUMNS,
        "count": len(FEATURE_COLUMNS),
    }


@app.post("/api/ml/predict-price/", response_model=PredictPriceResponse)
def predict_price_endpoint(body: PredictPriceRequest) -> Dict[str, Any]:
    payload = body.model_dump(by_alias=False, exclude_none=True)

    try:
        return predict_price_for_api(payload)
    except ModelArtifactsError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - unexpected inference failure
        raise HTTPException(status_code=500, detail="Price prediction failed.") from exc
