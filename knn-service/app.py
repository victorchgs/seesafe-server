from fastapi import FastAPI
import os
from pydantic import BaseModel
import numpy as np
import joblib
from util import get_features  # Certifique-se de que a função get_features esteja disponível
from typing import List

app = FastAPI()

model_path_knn = os.path.join("models", "knn_model.pkl")
model_path_scaler = os.path.join("models", "scaler.pkl")

scaler = joblib.load(model_path_scaler)
knn_model = joblib.load(model_path_knn)

class PredictionRequest(BaseModel):
    acc_x: List[float]
    acc_y: List[float]
    acc_z: List[float]
    gyro_x: List[float]
    gyro_y: List[float]
    gyro_z: List[float]


@app.post("/predict")
async def predict(data: PredictionRequest):
    print("Recebendo dados para predição.")
    try:
        acc_x = np.array(data.acc_x)
        acc_y = np.array(data.acc_y)
        acc_z = np.array(data.acc_z)
        gyro_x = np.array(data.gyro_x)
        gyro_y = np.array(data.gyro_y)
        gyro_z = np.array(data.gyro_z)

        # Extrair features
        features = get_features(acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z)

        if len(features) == 0:
            return {"error": "Não foi possível extrair features dos dados."}

        # Normalizar as features
        features_scaled = scaler.transform(features)

        # Fazer predição
        predictions = knn_model.predict(features_scaled)
        # print("predições: ", predictions)
        return {"predictions": predictions.tolist()}
    
    except Exception as e:
        return {"error": str(e)}
