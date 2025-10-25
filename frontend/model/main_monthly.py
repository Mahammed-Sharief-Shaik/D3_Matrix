import pandas as pd
import numpy as np
import joblib
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime

# --- 1. Configuration & Global Variables ---
MODEL_PATH = "model_artifacts/monthly_demand_model.joblib"
FEATURES_PATH = "model_artifacts/monthly_model_features.joblib"

# Paths to data needed for *new* data feature engineering
# (These are needed if you want the API to predict multiple months ahead,
# but for a single month prediction, we only need the historical data passed in)
RAINFALL_CSV_PATH = "monthly_rainfall.csv" # If needed for future feature engineering
ANNUAL_ECON_CSV = "annual_economic_data_extended.csv" # If needed
ANNUAL_VEHICLES_CSV = "annual_total_vehicles.csv" # If needed

# --- 2. Initialize FastAPI App ---
app = FastAPI(
    title="Delhi Monthly Power Demand API",
    description="API to predict total monthly power demand."
)

# --- 3. Load Model and Features on Startup ---
try:
    print("Loading monthly model...")
    monthly_model = joblib.load(MODEL_PATH)
    print("Loading monthly model features...")
    model_features = joblib.load(FEATURES_PATH)
    print(f"  Model expects {len(model_features)} features.")
    print("\n--- Monthly API Ready ---")
except Exception as e:
    print(f"FATAL ERROR: Could not load monthly artifacts. {e}")
    monthly_model, model_features = None, None

# --- 4. Define Input/Output Schemas ---

class MonthlyDataPoint(BaseModel):
    """
    Represents the aggregated data for ONE month.
    The MERN app needs to send the last 12 of these.
    """
    Year: int
    Month: int
    Total_Demand_kW: float
    temp: float
    dwpt: float
    rhum: float
    wdir: float
    wspd: float
    pres: float
    Total_Rainfall_mm: float
    # Add all the forward-filled annual features
    Companies_Newly_Registered: float
    Land_Net_Area_Sown: float
    Labour_Force_Participation_All: float
    Total_Vehicles_Plying: float
    # Add any other features included during training

class MonthlyPredictionResponse(BaseModel):
    predicted_total_demand_kw: float
    prediction_for_month: str # e.g., "2025-11"
    prediction_time_utc: str

# --- 5. The Monthly Prediction Endpoint ---

@app.post("/predict_monthly", response_model=MonthlyPredictionResponse)
async def predict_monthly(historical_data: List[MonthlyDataPoint]):
    """
    Predicts the total power demand for the NEXT month.
    
    Expects a JSON list of the last 12 months of aggregated data.
    """
    if not monthly_model or not model_features:
        raise HTTPException(status_code=500, detail="Monthly model artifacts not loaded.")

    # 1. Check if we have enough historical data (at least 12 months for lag_12)
    if len(historical_data) < 12:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough historical data. Requires at least 12 months "
                   f"to calculate lag features. You sent {len(historical_data)}."
        )

    # 2. Convert to DataFrame
    # Ensure columns match EXACTLY what the model was trained on
    input_df = pd.DataFrame([row.dict() for row in historical_data])
    # Rename Year and Month for consistency if needed
    input_df = input_df.rename(columns={"Year": "year", "Month": "month"}) 
    
    # Use only the last 12+ months needed for lags calculation
    input_df = input_df.tail(12 + 3) # Keep enough for rolling avg + lags

    # 3. Create Lag Features for the *potential* next row
    input_df['demand_lag_12'] = input_df['Total_Demand_kW'].shift(12)
    input_df['demand_lag_1'] = input_df['Total_Demand_kW'].shift(1)
    input_df['demand_rolling_3'] = input_df['Total_Demand_kW'].shift(1).rolling(3).mean()

    # 4. Get the *last* row - this contains the features for the next prediction
    features_for_prediction = input_df.iloc[-1]

    # Check if lags were successfully created (not NaN)
    if features_for_prediction[['demand_lag_12', 'demand_lag_1', 'demand_rolling_3']].isnull().any():
         raise HTTPException(
            status_code=400,
            detail="Could not calculate necessary lag features from the provided history. "
                   "Ensure you sent at least 12 consecutive months."
        )

    # 5. Prepare the feature vector in the correct order
    try:
        # Select and order features EXACTLY as the model expects
        feature_vector = features_for_prediction[model_features].values.reshape(1, -1)
    except KeyError as e:
         raise HTTPException(
            status_code=400,
            detail=f"Missing feature in input data: {e}. Ensure all required columns are sent."
        )
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Error preparing feature vector: {e}")


    # 6. Make prediction
    prediction = monthly_model.predict(feature_vector)[0]

    # 7. Determine the next month for the response
    last_year = int(features_for_prediction['year'])
    last_month = int(features_for_prediction['month'])
    if last_month == 12:
        next_year = last_year + 1
        next_month = 1
    else:
        next_year = last_year
        next_month = last_month + 1
    prediction_month_str = f"{next_year}-{next_month:02d}"


    return {
        "predicted_total_demand_kw": prediction,
        "prediction_for_month": prediction_month_str,
        "prediction_time_utc": datetime.utcnow().isoformat()
    }

# --- 6. (Optional) Root Endpoint ---
@app.get("/")
def read_root():
    return {"message": "Delhi Monthly Power Demand API is running."}

# This allows running the file directly: python monthly_api.py
if __name__ == "__main__":
    # Run on a different port than the 5-min API
    uvicorn.run(app, host="0.0.0.0", port=8001) 
