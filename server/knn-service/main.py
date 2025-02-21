from fastapi import FastAPI
import os
from pydantic import BaseModel
import numpy as np
import joblib
from util import get_features  # Certifique-se de que a função get_features esteja disponível
from typing import List
import pandas as pd

app = FastAPI()

model_path_knn = os.path.join("models", "knn_model.pkl")
model_path_scaler = os.path.join("models", "scaler.pkl")

scaler = joblib.load(model_path_scaler)
knn_model = joblib.load(model_path_knn)

class SensorData(BaseModel):
    x: float
    y: float
    z: float
    timestamp: float

class PredictionRequest(BaseModel):
    gyroscopeData: List[SensorData]
    accelerometerData: List[SensorData]

@app.post("/predict")
async def predict(data: PredictionRequest):
    try:
        gyro_df = pd.DataFrame([sensor.dict() for sensor in data.gyroscopeData])
        accel_df = pd.DataFrame([sensor.dict() for sensor in data.accelerometerData])
        nearest_indices = gyro_df['timestamp'].apply(
            lambda t: np.argmin(np.abs(accel_df['timestamp'] - t))
        )

        gyro_df['nearest_acc_timestamp'] = accel_df['timestamp'].iloc[nearest_indices].values
        combined_data = gyro_df.merge(accel_df, left_on='nearest_acc_timestamp', right_on='timestamp', suffixes=('_gyro', '_acc'))

        combined_data.drop(columns=['nearest_acc_timestamp'], inplace=True)

        features = get_features(
            combined_data["x_acc"], 
            combined_data["y_acc"], 
            combined_data["z_acc"], 
            combined_data["x_gyro"], 
            combined_data["y_gyro"], 
            combined_data["z_gyro"])

        if len(features) == 0:
            return {"error": "Não foi possível extrair features dos dados."}

        features_scaled = scaler.transform(features) # normalizar features
        predictions = knn_model.predict(features_scaled) # fazer predição

        return {"predictions": predictions.tolist()}
    
    except Exception as e:
        print("Erro ao fazer predição: ", e)
        return {"predictions": [0]}
    
if __name__ == "__main__":
    import uvicorn
    # Iniciar o servidor FastAPI
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)