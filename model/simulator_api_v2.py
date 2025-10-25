import pandas as pd
import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import requests
from datetime import datetime
import json # For handling numpy types in JSON

# --- 1. Configuration ---
# Data Paths
DATA_5MIN_CSV_PATH = "delhi_demand_final_cyclical.csv"
DATA_MONTHLY_CSV_PATH = "delhi_monthly_features_v3.csv"

# API URLs
PREDICTION_5MIN_API_URL = "http://127.0.0.1:8000/predict?steps=1"
PREDICTION_MONTHLY_API_URL = "http://127.0.0.1:8001/predict_monthly"

# History Requirements
REQUIRED_5MIN_HISTORY_ROWS = 2304 # 7 days + 24 hours
REQUIRED_MONTHLY_HISTORY_ROWS = 15 # 12 months for lag + 3 for rolling

# --- 2. Initialize FastAPI App ---
app = FastAPI(
    title="Delhi Power Demand Simulator API v2",
    description="Simulates 5-min data, calls prediction APIs, provides graph data."
)

# --- 3. Load Data & Initialize State ---
GLOBAL_DATA_5MIN_DF = None
GLOBAL_DATA_MONTHLY_DF = None
current_data_index_5min = -1

# Helper function to handle potential numpy types during JSON conversion
def default_serializer(obj):
    if isinstance(obj, (np.integer, np.floating, np.bool_)):
        return obj.item()
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif pd.isna(obj):
        return None # Convert Pandas NaT/NaN to None
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")


@app.on_event("startup")
async def load_all_data():
    global GLOBAL_DATA_5MIN_DF, GLOBAL_DATA_MONTHLY_DF, current_data_index_5min
    try:
        # Load 5-minute data
        print(f"Loading 5-minute data from: {DATA_5MIN_CSV_PATH}")
        GLOBAL_DATA_5MIN_DF = pd.read_csv(DATA_5MIN_CSV_PATH)
        GLOBAL_DATA_5MIN_DF['datetime'] = pd.to_datetime(GLOBAL_DATA_5MIN_DF['datetime'])
        print(f"  5-min data loaded. Total rows: {len(GLOBAL_DATA_5MIN_DF)}")

        # Load monthly data
        print(f"Loading monthly data from: {DATA_MONTHLY_CSV_PATH}")
        GLOBAL_DATA_MONTHLY_DF = pd.read_csv(DATA_MONTHLY_CSV_PATH)
        # Create a proper date index for easier lookup
        GLOBAL_DATA_MONTHLY_DF['date'] = pd.to_datetime(GLOBAL_DATA_MONTHLY_DF[['year', 'month']].assign(day=1)) + pd.offsets.MonthEnd(0)
        GLOBAL_DATA_MONTHLY_DF = GLOBAL_DATA_MONTHLY_DF.set_index('date')
        print(f"  Monthly data loaded. Total rows: {len(GLOBAL_DATA_MONTHLY_DF)}")

        # Initialize 5-minute index
        start_offset = 100
        initial_index = len(GLOBAL_DATA_5MIN_DF) - start_offset
        if initial_index < REQUIRED_5MIN_HISTORY_ROWS:
             initial_index = REQUIRED_5MIN_HISTORY_ROWS
        current_data_index_5min = initial_index

        print(f"Simulation starting at 5-min index: {current_data_index_5min}")
        print("\n--- Simulator API v2 Ready ---")

    except FileNotFoundError as e:
        print(f"FATAL ERROR: Could not find data file: {e}")
        GLOBAL_DATA_5MIN_DF, GLOBAL_DATA_MONTHLY_DF = None, None
    except Exception as e:
        print(f"FATAL ERROR loading data: {e}")
        GLOBAL_DATA_5MIN_DF, GLOBAL_DATA_MONTHLY_DF = None, None

# --- 4. Define Output Schema ---
class GraphDataPoint(BaseModel):
    # Simplified structure for graphs
    time: str
    value: float | None # Allow None for potential NaNs

class MonthlyGraphDataPoint(BaseModel):
    year: int
    month: int
    value: float | None

class LiveUpdateResponseV2(BaseModel):
    current_data_5min: Dict[str, Any]
    predicted_next_5_min_demand_kw: float | None # Allow None if prediction fails
    predicted_next_month_demand_kw: float | None # Allow None if prediction fails
    next_simulated_datetime_5min: str
    past_24_hours_demand: List[GraphDataPoint]
    past_12_months_demand: List[MonthlyGraphDataPoint]

# --- 5. The Simulation Endpoint ---

@app.get("/get_live_update_v2", response_model=LiveUpdateResponseV2)
async def get_live_update_v2():
    global current_data_index_5min

    if GLOBAL_DATA_5MIN_DF is None or GLOBAL_DATA_MONTHLY_DF is None:
        raise HTTPException(status_code=500, detail="Simulation data not loaded.")

    if current_data_index_5min >= len(GLOBAL_DATA_5MIN_DF):
         raise HTTPException(status_code=404, detail="End of 5-min simulation data reached.")

    # --- Part 1: 5-Minute Simulation & Prediction ---
    current_row_5min_series = GLOBAL_DATA_5MIN_DF.iloc[current_data_index_5min]
    current_row_5min = current_row_5min_series.replace({np.nan: None}).to_dict()
    current_dt = current_row_5min_series['datetime'] # Get Timestamp object
    if isinstance(current_dt, pd.Timestamp):
         current_row_5min['datetime'] = current_dt.strftime('%Y-%m-%d %H:%M:%S')

    # Get history for 5-min prediction
    hist_5min_start = max(0, current_data_index_5min - REQUIRED_5MIN_HISTORY_ROWS + 1)
    hist_5min_end = current_data_index_5min + 1
    history_df_5min = GLOBAL_DATA_5MIN_DF.iloc[hist_5min_start:hist_5min_end]

    # Format for 5-min API
    history_df_renamed = history_df_5min.rename(columns={"Power demand": "Power_demand"})
    api_input_5min = []
    for _, row in history_df_renamed.iterrows():
        point = { # Match RawDataPoint from main.py
            "datetime": row['datetime'].strftime('%Y-%m-%d %H:%M:%S'),
            "Power_demand": row['Power_demand'], "temp": row['temp'], "dwpt": row['dwpt'],
            "rhum": row['rhum'], "wdir": row['wdir'], "wspd": row['wspd'],
            "pres": row['pres'], "moving_avg_3": row.get('moving_avg_3', 0.0)
        }
        api_input_5min.append(point)

    # Call 5-min Prediction API
    predicted_5min = None
    try:
        response_5min = requests.post(PREDICTION_5MIN_API_URL, json=api_input_5min, timeout=10)
        response_5min.raise_for_status()
        result_5min = response_5min.json()
        if result_5min.get("predicted_demand_kw"):
            predicted_5min = result_5min["predicted_demand_kw"][0]
    except Exception as e:
        print(f"Warning: 5-min prediction API call failed: {e}")
        # Continue without raising error, return None for prediction

    # --- Part 2: Monthly Prediction ---
    # Find the end of the "current" month based on the 5-min index
    current_month_end_dt = current_dt.to_period('M').end_time

    # Get history for monthly prediction (last 15 months ending *before* current month)
    # We need the data ending in the *previous* month to predict the *current* month if needed,
    # or ending in the current month to predict the *next* month.
    # Let's predict the month *after* the current simulation month.
    hist_monthly_end_date = current_month_end_dt
    hist_monthly_start_date = hist_monthly_end_date - pd.DateOffset(months=REQUIRED_MONTHLY_HISTORY_ROWS - 1)

    # Slice the monthly dataframe using dates
    history_df_monthly = GLOBAL_DATA_MONTHLY_DF[
        (GLOBAL_DATA_MONTHLY_DF.index >= hist_monthly_start_date) &
        (GLOBAL_DATA_MONTHLY_DF.index <= hist_monthly_end_date)
    ].reset_index(drop=True) # Reset index for JSON conversion

    predicted_monthly = None
    if len(history_df_monthly) >= 12: # Need at least 12 for lags
        # Format for monthly API (match MonthlyDataPoint)
        # Convert df to list of dicts, handle numpy types
        api_input_monthly = json.loads(history_df_monthly.to_json(orient='records', default_handler=str)) # Use string handler for dates/timestamps initially
        
        # Manually ensure types match Pydantic model if needed (e.g., Year/Month as int)
        for record in api_input_monthly:
            record['Year'] = int(record['year'])
            record['Month'] = int(record['month'])
            # Ensure other numeric types are floats/ints as expected by MonthlyDataPoint


        try:
            response_monthly = requests.post(PREDICTION_MONTHLY_API_URL, json=api_input_monthly, timeout=10)
            response_monthly.raise_for_status()
            result_monthly = response_monthly.json()
            predicted_monthly = result_monthly.get("predicted_total_demand_kw")
        except Exception as e:
            print(f"Warning: Monthly prediction API call failed: {e}")
            # Continue, return None for prediction
    else:
        print(f"Warning: Not enough monthly history ({len(history_df_monthly)} months) to call monthly API.")


    # --- Part 3: Prepare Graph Data ---
    # Past 24 hours (288 steps) of 5-min data
    graph_5min_start = max(0, current_data_index_5min - 288 + 1)
    graph_5min_end = current_data_index_5min + 1
    past_24h_df = GLOBAL_DATA_5MIN_DF.iloc[graph_5min_start:graph_5min_end][['datetime', 'Power demand']]
    past_24h_data = [
        {"time": row['datetime'].strftime('%Y-%m-%d %H:%M:%S'), "value": row['Power demand']}
        for _, row in past_24h_df.iterrows()
    ]

    # Past 12 months of monthly data
    graph_monthly_end_date = current_month_end_dt
    graph_monthly_start_date = graph_monthly_end_date - pd.DateOffset(months=11) # Go back 11 months to get 12 total
    past_12m_df = GLOBAL_DATA_MONTHLY_DF[
         (GLOBAL_DATA_MONTHLY_DF.index >= graph_monthly_start_date) &
         (GLOBAL_DATA_MONTHLY_DF.index <= graph_monthly_end_date)
    ][['year', 'month', 'Total_Demand_kW']].reset_index(drop=True)

    # Convert df to list of dicts, handling potential NaNs
    past_12m_data_raw = json.loads(past_12m_df.to_json(orient='records'))
    # Clean up structure for MonthlyGraphDataPoint
    past_12m_data = [
        {"year": int(row['year']), "month": int(row['month']), "value": row['Total_Demand_kW']}
        for row in past_12m_data_raw
    ]


    # --- Part 4: Increment Index and Return ---
    current_data_index_5min += 1
    next_datetime_str_5min = "End of data"
    if current_data_index_5min < len(GLOBAL_DATA_5MIN_DF):
         next_datetime_str_5min = GLOBAL_DATA_5MIN_DF.iloc[current_data_index_5min]['datetime'].strftime('%Y-%m-%d %H:%M:%S')

    # Use default_serializer to handle potential numpy types in current_row_5min
    serializable_current_row = json.loads(json.dumps(current_row_5min, default=default_serializer))


    return {
        "current_data_5min": serializable_current_row,
        "predicted_next_5_min_demand_kw": predicted_5min,
        "predicted_next_month_demand_kw": predicted_monthly,
        "next_simulated_datetime_5min": next_datetime_str_5min,
        "past_24_hours_demand": past_24h_data,
        "past_12_months_demand": past_12m_data
    }

# --- Root Endpoint ---
@app.get("/")
def read_root():
    return {"message": "Delhi Power Demand Simulator API v2 is running."}

# --- Run ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002) # Run on port 8002
