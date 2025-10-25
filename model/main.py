import pandas as pd
import numpy as np
import tensorflow as tf
import joblib
import holidays
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta

# --- 1. Configuration & Global Variables ---
MODEL_PATH = "model_artifacts/best_demand_model.keras"
SCALER_PATH = "model_artifacts/demand_scaler.pkl"
RAINFALL_CSV_PATH = "model_artifacts/monthly_rainfall.csv"

TIMESTEPS = 288
LAG_WEEKS = 2016
REQUIRED_INPUT_ROWS = TIMESTEPS + LAG_WEEKS # 2304

SEASON_MAP = {
    1: 'Winter', 2: 'Winter', 3: 'Summer', 4: 'Summer', 5: 'Summer',
    6: 'Monsoon', 7: 'Monsoon', 8: 'Monsoon', 9: 'Monsoon',
    10: 'Post-Monsoon', 11: 'Post-Monsoon', 12: 'Winter'
}

# --- 2. Initialize FastAPI App ---
app = FastAPI(
    title="Delhi Power Demand API",
    description="API to predict 5-minute power demand recursively."
)

# --- 3. Load Artifacts on Startup ---
try:
    print("Loading model...")
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Loading scaler...")
    scaler = joblib.load(SCALER_PATH)
    
    print("Loading and processing rainfall data...")
    rainfall_df_raw = pd.read_csv(RAINFALL_CSV_PATH)
    rainfall_long = rainfall_df_raw.melt(
        id_vars=['Year', 'Metric'],
        value_vars=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        var_name='MonthName', value_name='Value'
    )
    rainfall_tidy = rainfall_long.pivot_table(
        index=['Year', 'MonthName'], columns='Metric', values='Value'
    ).reset_index().rename(columns={
        'Rainy Days': 'Monthly_Rainy_Days',
        'Total Rainfall': 'Monthly_Total_Rainfall'
    })
    month_map = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    }
    rainfall_tidy['month'] = rainfall_tidy['MonthName'].map(month_map)
    RAINFALL_DATA = rainfall_tidy[['Year', 'month', 'Monthly_Rainy_Days', 'Monthly_Total_Rainfall']].copy()
    
    print("Loading holiday list...")
    HOLIDAY_LIST = holidays.India(subdiv='DL', years=[2021, 2022, 2023, 2024, 2025])
    
    print("\n--- Server Ready ---")

except Exception as e:
    print(f"FATAL ERROR: Could not load artifacts. {e}")
    model, scaler, RAINFALL_DATA, HOLIDAY_LIST = None, None, None, None

# --- 4. Define Input/Output Schemas ---

class RawDataPoint(BaseModel):
    datetime: str
    Power_demand: float
    temp: float
    dwpt: float
    rhum: float
    wdir: float
    wspd: float
    pres: float
    moving_avg_3: float

class PredictionResponse(BaseModel):
    # The API now returns a LIST of predictions
    predicted_demand_kw: List[float]
    prediction_time_utc: str
    warning: str = ""

# --- 5. Feature Engineering Pipeline ---

def feature_engineer(data_df: pd.DataFrame) -> pd.DataFrame:
    """
    Runs the *entire* feature engineering pipeline on the raw input data.
    """
    # Create a copy to avoid changing the original df in the loop
    df = data_df.copy()

    # 1. Datetime features
    df['datetime'] = pd.to_datetime(df['datetime'])
    df['year'] = df['datetime'].dt.year
    df['month'] = df['datetime'].dt.month
    df['day'] = df['datetime'].dt.day
    df['hour'] = df['datetime'].dt.hour
    df['minute'] = df['datetime'].dt.minute
    df['day_of_week'] = df['datetime'].dt.dayofweek
    
    # 2. Weekend
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    
    # 3. Holiday
    df['is_holiday'] = df['datetime'].dt.date.isin(HOLIDAY_LIST).astype(int)
    
    # 4. Rainfall
    df = pd.merge(
        df,
        RAINFALL_DATA,
        left_on=['year', 'month'],
        right_on=['Year', 'month'],
        how='left'
    )
    df['Monthly_Rainy_Days'] = df['Monthly_Rainy_Days'].fillna(0)
    df['Monthly_Total_Rainfall'] = df['Monthly_Total_Rainfall'].fillna(0)
    
    # 5. Season
    df['season'] = df['month'].map(SEASON_MAP)
    
    # 6. Lag features
    df['demand_lag_1hr'] = df['Power demand'].shift(12)
    df['demand_lag_24hr'] = df['Power demand'].shift(288)
    df['demand_lag_1week'] = df['Power demand'].shift(2016)
    
    # 7. Cyclical features
    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24.0)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24.0)
    df['day_of_week_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7.0)
    df['day_of_week_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7.0)
    df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12.0)
    df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12.0)

    # 8. One-Hot Encode Season
    season_dummies = pd.get_dummies(df['season'], prefix='season', dtype=int)
    df = pd.concat([df, season_dummies], axis=1)
    
    for s in ['season_Winter', 'season_Summer', 'season_Monsoon', 'season_Post-Monsoon']:
        if s not in df.columns:
            df[s] = 0
            
    # 9. Drop all rows with NaNs from lags
    df = df.dropna().reset_index(drop=True)
    
    return df

# --- 6. The RECURSIVE Prediction Endpoint ---

@app.post("/predict", response_model=PredictionResponse)
async def predict(raw_data: List[RawDataPoint], steps: int = 1):
    """
    Predicts the power demand for the next 'steps' 5-minute intervals.
    
    - 'steps=1': Single, accurate prediction.
    - 'steps > 1': Recursive, less accurate prediction.
    """
    if not model or not scaler:
        raise HTTPException(status_code=500, detail="Model artifacts not loaded.")
        
    if len(raw_data) < REQUIRED_INPUT_ROWS:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough data. Requires {REQUIRED_INPUT_ROWS} rows, got {len(raw_data)}."
        )

    # Convert to DataFrame
    input_df = pd.DataFrame([row.dict() for row in raw_data])
    input_df = input_df.rename(columns={"Power_demand": "Power demand"})

    predictions_list = []
    current_df = input_df.copy()

    for i in range(steps):
        # 1. Run the full feature engineering pipeline
        try:
            features_df = feature_engineer(current_df)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Feature engineering failed: {e}")

        # 2. Get the last TIMESTEPS rows for the model
        if len(features_df) < TIMESTEPS:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough clean data after processing. Need {TIMESTEPS} rows, "
                       f"but only {len(features_df)} were left."
            )
        
        final_window_df = features_df.tail(TIMESTEPS)
        
        # 3. Scale the data
        try:
            feature_order = scaler.feature_names_in_
            X_scaled = scaler.transform(final_window_df[feature_order])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Scaling failed: {e}")
        
        # 4. Reshape and Predict
        X_reshaped = np.expand_dims(X_scaled, axis=0)
        scaled_pred = model.predict(X_reshaped)[0][0]
        
        # 5. Un-scale the prediction
        dummy_array = np.zeros((1, scaler.n_features_in_))
        dummy_array[0, 0] = scaled_pred
        real_pred = scaler.inverse_transform(dummy_array)[0, 0]
        
        # Add the prediction to our list
        predictions_list.append(real_pred)

        # 6. Prepare for the *next* loop (if not the last step)
        if i < steps - 1:
            # Get the last *raw* row to copy weather data
            last_raw_row = current_df.iloc[-1]
            
            # Create a new "fake" raw row
            new_datetime = (pd.to_datetime(last_raw_row['datetime']) + timedelta(minutes=5))
            
            # Calculate the new 'moving_avg_3'
            new_moving_avg = (
                real_pred + 
                last_raw_row['Power demand'] + 
                current_df.iloc[-2]['Power demand']
            ) / 3.0

            new_raw_row_dict = {
                "datetime": new_datetime.strftime('%Y-%m-%d %H:%M:%S'),
                "Power demand": real_pred, # Use the predicted demand
                "moving_avg_3": new_moving_avg,
                
                # --- Naive Assumption: Weather doesn't change ---
                "temp": last_raw_row['temp'],
                "dwpt": last_raw_row['dwpt'],
                "rhum": last_raw_row['rhum'],
                "wdir": last_raw_row['wdir'],
                "wspd": last_raw_row['wspd'],
                "pres": last_raw_row['pres']
            }

            # Append this new row (as a DataFrame)
            current_df = pd.concat([
                current_df, 
                pd.DataFrame([new_raw_row_dict])
            ], ignore_index=True)
            
            # Drop the *oldest* row to keep the window size constant
            current_df = current_df.iloc[1:]

    # After the loop, return the full list
    return {
        "predicted_demand_kw": predictions_list,
        "prediction_time_utc": datetime.utcnow().isoformat(),
        "warning": "Predictions beyond the first step are recursive and may be inaccurate due to error accumulation and naive weather assumptions." if steps > 1 else ""
    }

# --- 7. Root Endpoint ---
@app.get("/")
def read_root():
    return {"message": "Delhi Power Demand API is running."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

