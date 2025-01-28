from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
from util import get_features  # Certifique-se de que a função get_features esteja disponível.

app = FastAPI()

# Carregar o scaler e o modelo
scaler = joblib.load("models/scaler.pkl")
knn_model = joblib.load("models/knn_model.pkl")

class PredictionRequest(BaseModel):
    acc_x: list
    acc_y: list
    acc_z: list
    gyro_x: list
    gyro_y: list
    gyro_z: list


@app.post("/predict")
async def predict(data: PredictionRequest):
    try:
        # Processar os dados recebidos
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

        return {"predictions": predictions.tolist()}
    
    except Exception as e:
        return {"error": str(e)}
