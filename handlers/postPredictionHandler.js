import { predictWithKNN } from "../services/knnService.js";

export async function postPredictionHandler(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);
    console.log("Dados recebidos:", data);

    const { acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z } = data;
    if (!acc_x || !gyro_x) {
      res.code = "4.00";
      return res.end(JSON.stringify({ error: "Dados incompletos." }));
    }

    const dataLength = data.acc_x.length;

    if (data.acc_y.length !== dataLength || 
        data.acc_z.length !== dataLength || 
        data.gyro_x.length !== dataLength || 
        data.gyro_y.length !== dataLength || 
        data.gyro_z.length !== dataLength) {
      res.code = "4.00";
      return res.end(JSON.stringify({ error: "Os dados devem ter o mesmo tamanho para todas as variáveis." }));
    }

    const formattedData = {
      acc_x: Array.isArray(data.acc_x) ? data.acc_x.map(Number) : [Number(data.acc_x)],
      acc_y: Array.isArray(data.acc_y) ? data.acc_y.map(Number) : [Number(data.acc_y)],
      acc_z: Array.isArray(data.acc_z) ? data.acc_z.map(Number) : [Number(data.acc_z)],
      gyro_x: Array.isArray(data.gyro_x) ? data.gyro_x.map(Number) : [Number(data.gyro_x)],
      gyro_y: Array.isArray(data.gyro_y) ? data.gyro_y.map(Number) : [Number(data.gyro_y)],
      gyro_z: Array.isArray(data.gyro_z) ? data.gyro_z.map(Number) : [Number(data.gyro_z)],
    };

    const predictions = await predictWithKNN(formattedData);

    console.log("Predições:", predictions);

    res.code = "2.05";
    res.end(JSON.stringify({ predictions }));
  } catch (error) {
    console.error("Erro no handler de predição:", error.message);
    res.code = "5.00";
    res.end(JSON.stringify({ error: "Erro no servidor." }));
  }
}
