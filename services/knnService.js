import axios from "axios";

const KNN_SERVICE_URL = "http://localhost:8000/predict";

export async function predict_fail(gyroscopeData, accelerometerData) {
  try {
    const data = { gyroscopeData, accelerometerData };
    
    const response = await axios.post(KNN_SERVICE_URL, data, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data.predictions;
  } catch (error) {
    console.error("Erro ao conectar ao microserviço KNN ", error.message);
    return { error: "Falha na predição do modelo KNN." };
  }
}
