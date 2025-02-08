import axios from "axios";

const KNN_SERVICE_URL = "http://localhost:8000/predict";

export async function predict(data) {
  try {
    console.log("Dados recebidos:", data);
    
    const { acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z } = data;
    if (!acc_x || !gyro_x) {
      throw new Error("Dados incompletos.");
    }
    
    const dataLength = acc_x.length;
    if ([acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z].some(arr => arr.length !== dataLength)) {
      throw new Error("Os dados devem ter o mesmo tamanho para todas as variáveis.");
    }

    const formattedData = {
      acc_x: Array.isArray(acc_x) ? acc_x.map(Number) : [Number(acc_x)],
      acc_y: Array.isArray(acc_y) ? acc_y.map(Number) : [Number(acc_y)],
      acc_z: Array.isArray(acc_z) ? acc_z.map(Number) : [Number(acc_z)],
      gyro_x: Array.isArray(gyro_x) ? gyro_x.map(Number) : [Number(gyro_x)],
      gyro_y: Array.isArray(gyro_y) ? gyro_y.map(Number) : [Number(gyro_y)],
      gyro_z: Array.isArray(gyro_z) ? gyro_z.map(Number) : [Number(gyro_z)],
    };



    const predictions = await predictWithKNN(formattedData);
    console.log("Predições:", predictions);
    return { success: true, predictions };
  } catch (error) {
    console.error("Erro na predição:", error.message);
    return { success: false, error: error.message };
  }
}

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
