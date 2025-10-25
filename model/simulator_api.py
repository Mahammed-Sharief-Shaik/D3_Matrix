import pandas as pd
import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import requests # Needed to call the other API
from datetime import datetime

# --- 1. Configuration ---

# Path to the dataset WITH FEATURES but BEFORE scaling/splitting
# Ensure this file exists and contains columns like 'hour', 'month', 'temp', etc.
# Using the file created after adding cyclical features is a good choice.
DATA_CSV_PATH = "delhi_demand_final_cyclical.csv" 

# URL of your *running* 5-minute prediction API (main.py)
PREDICTION_API_URL = "http://127.0.0.1:8000/predict?steps=1" 

# How many rows of history the prediction API needs
REQUIRED_HISTORY_ROWS = 2304 # 7 days + 24 hours

# --- 2. Initialize FastAPI App ---
app = FastAPI(
    title="Delhi Power Demand Simulator API",
    description="Simulates live data and calls the prediction API."
)

# --- 3. Load Data & Initialize State ---
GLOBAL_DATA_DF = None
current_data_index = -1

@app.on_event("startup")
async def load_data():
    global GLOBAL_DATA_DF, current_data_index
    try:
        print(f"Loading simulation data from: {DATA_CSV_PATH}")
        # Load the *entire* dataset into memory
        GLOBAL_DATA_DF = pd.read_csv(DATA_CSV_PATH)
        # Ensure datetime is usable if needed, though we primarily use index
        GLOBAL_DATA_DF['datetime'] = pd.to_datetime(GLOBAL_DATA_DF['datetime']) 
        
        # Start simulation near the end (e.g., 100 steps from the end)
        # Ensure we start *after* the initial rows needed for lags
        start_offset = 100 
        initial_index = len(GLOBAL_DATA_DF) - start_offset
        if initial_index < REQUIRED_HISTORY_ROWS:
             initial_index = REQUIRED_HISTORY_ROWS # Start as early as possible if dataset is small
        
        current_data_index = initial_index
        
        print(f"Data loaded. Total rows: {len(GLOBAL_DATA_DF)}")
        print(f"Simulation starting at index: {current_data_index}")
        print("\n--- Simulator API Ready ---")
        
    except FileNotFoundError:
        print(f"FATAL ERROR: Could not find data file: {DATA_CSV_PATH}")
        GLOBAL_DATA_DF = None
    except Exception as e:
        print(f"FATAL ERROR loading data: {e}")
        GLOBAL_DATA_DF = None

# --- 4. Define Output Schema ---

class LiveUpdateResponse(BaseModel):
    current_data: Dict[str, Any] # The "current" row from the CSV
    predicted_next_5_min_demand_kw: float
    next_simulated_datetime: str # Shows the timestamp the index moved to

# --- 5. The Simulation Endpoint ---

@app.get("/get_live_update", response_model=LiveUpdateResponse)
async def get_live_update():
    global current_data_index
    
    if GLOBAL_DATA_DF is None:
        raise HTTPException(status_code=500, detail="Simulation data not loaded.")
        
    # Check if we've run out of data
    if current_data_index >= len(GLOBAL_DATA_DF):
         raise HTTPException(status_code=404, detail="End of simulation data reached.")

    # 1. Get the "current" row data
    # Convert to dict; handle potential NaN JSON issues
    current_row = GLOBAL_DATA_DF.iloc[current_data_index].replace({np.nan: None}).to_dict()
    # Convert Timestamp to string for JSON compatibility
    if isinstance(current_row.get('datetime'), pd.Timestamp):
         current_row['datetime'] = current_row['datetime'].strftime('%Y-%m-%d %H:%M:%S')

    # 2. Get the required history for the prediction API
    history_start_index = max(0, current_data_index - REQUIRED_HISTORY_ROWS + 1)
    history_end_index = current_data_index + 1 # Include the current row
    
    if history_end_index - history_start_index < REQUIRED_HISTORY_ROWS:
         raise HTTPException(
             status_code=400, 
             detail=f"Not enough historical data available at index {current_data_index} "
                    f"to make prediction. Need {REQUIRED_HISTORY_ROWS} rows."
         )
         
    history_df = GLOBAL_DATA_DF.iloc[history_start_index:history_end_index]

    # 3. Format history for the prediction API (List of Dicts)
    # The prediction API expects specific keys (RawDataPoint model)
    # Ensure column names match what main.py expects ('Power_demand' vs 'Power demand')
    # Use only the columns required by the RawDataPoint model in main.py
    required_cols = ["datetime", "Power demand", "temp", "dwpt", "rhum", 
                     "wdir", "wspd", "pres", "moving_avg_3"] 
    
    # Rename 'Power demand' to 'Power_demand' if needed by main.py's Pydantic model
    # Adjust this based on your main.py RawDataPoint definition
    history_df_renamed = history_df.rename(columns={"Power demand": "Power_demand"})

    api_input_list = []
    for _, row in history_df_renamed.iterrows():
        point = {
            "datetime": row['datetime'].strftime('%Y-%m-%d %H:%M:%S'),
            "Power_demand": row['Power_demand'], 
            "temp": row['temp'],
            "dwpt": row['dwpt'],
            "rhum": row['rhum'],
            "wdir": row['wdir'],
            "wspd": row['wspd'],
            "pres": row['pres'],
            "moving_avg_3": row.get('moving_avg_3', 0.0) # Use get() in case column is missing
        }
        api_input_list.append(point)

    # 4. Call the prediction API
    predicted_demand = None
    try:
        response = requests.post(PREDICTION_API_URL, json=api_input_list, timeout=10) # 10 sec timeout
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        prediction_result = response.json()
        
        # Get the first prediction from the list
        if prediction_result.get("predicted_demand_kw"):
            predicted_demand = prediction_result["predicted_demand_kw"][0] 
        else:
            print("Prediction API response missing 'predicted_demand_kw'")
            
    except requests.exceptions.RequestException as e:
        print(f"Error calling prediction API: {e}")
        # Optionally, raise an HTTPException or return a default/error value
        raise HTTPException(status_code=503, detail=f"Prediction API call failed: {e}")
    except Exception as e:
        print(f"Error processing prediction response: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing prediction: {e}")

    # 5. Increment the index for the next call
    current_data_index += 1
    
    # Get the timestamp for the *next* step (for display)
    next_datetime_str = "End of data"
    if current_data_index < len(GLOBAL_DATA_DF):
         next_datetime_str = GLOBAL_DATA_DF.iloc[current_data_index]['datetime'].strftime('%Y-%m-%d %H:%M:%S')


    return {
        "current_data": current_row,
        "predicted_next_5_min_demand_kw": predicted_demand if predicted_demand is not None else -1.0, # Indicate error if None
        "next_simulated_datetime": next_datetime_str
    }

# --- 6. (Optional) Root Endpoint ---
@app.get("/")
def read_root():
    return {"message": "Delhi Power Demand Simulator API is running."}

# --- Run the server ---
if __name__ == "__main__":
    # Run on a different port than the main prediction API
    uvicorn.run(app, host="0.0.0.0", port=8002) 
