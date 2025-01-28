import { predictWithKNN } from "../services/knnService.js";

export async function postPredictionHandler(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);

    // Validação dos dados recebidos
    const { acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z } = data;
    if (!acc_x || !gyro_x) {
      res.code = "4.00";
      return res.end(JSON.stringify({ error: "Dados incompletos." }));
    }

    // Predição via microserviço Python
    const predictions = await predictWithKNN(data);

    res.code = "2.05";
    res.end(JSON.stringify({ predictions }));
  } catch (error) {
    console.error("Erro no handler de predição:", error.message);
    res.code = "5.00";
    res.end(JSON.stringify({ error: "Erro no servidor." }));
  }
}
