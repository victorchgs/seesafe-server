import { saveSensorsData } from "../utils/sensorsUtils.js";
import { validateDeviceId } from "../utils/deviceUtils.js";

export function postSensorsDataCaptureHandler(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);
    const {
      deviceId,
      accelerometerData,
      gyroscopeData,
      geolocationData,
      imageData,
    } = data;

    if (
      !deviceId ||
      !accelerometerData ||
      !gyroscopeData ||
      !geolocationData ||
      !imageData
    ) {
      res.code = "4.00";

      return res.end(
        JSON.stringify({
          error: "Payload inválido",
          message: "Dados com formato inválido.",
        })
      );
    }

    if (!validateDeviceId(deviceId)) {
      res.code = "4.01";

      return res.end(
        JSON.stringify({
          error: "ID inválido ou não autenticado",
        })
      );
    }

    const sensorData = {
      accelerometerData,
      gyroscopeData,
      geolocationData,
      imageData,
    };

    saveSensorsData(deviceId, sensorData);

    res.code = "2.05";
    res.end(
      JSON.stringify({
        message: "Dados do sensor recebidos com sucesso.",
        data: { deviceId, sensorData },
      })
    );
  } catch (error) {
    console.error("Erro ao processar o payload:", error);

    res.code = "4.00";
    res.end(
      JSON.stringify({
        error: "Erro ao processar o payload",
      })
    );
  }
}
