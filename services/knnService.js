import axios from "axios";

const KNN_SERVICE_URL = "http://localhost:8000/predict";

export async function predictWithKNN(data) {
  try {
    console.log("🔹 Enviando dados para o microserviço KNN:", data);
    const response = await axios.post(KNN_SERVICE_URL, data);
    return response.data.predictions;
  } catch (error) {
    console.error("Erro ao conectar ao microserviço KNN:", error.message);
    throw new Error("Falha na predição do modelo KNN.");
  }
}
