import { saveSensorsData } from "../utils/sensorsUtils.js";
import { validateDeviceId } from "../utils/deviceUtils.js";
import { predict } from "../services/knnService.js";

export function postSensorsDataCaptureHandler(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);
    const { deviceId, accelerometerData, gyroscopeData, geolocationData } =
      data;

    if (!deviceId || !accelerometerData || !gyroscopeData || !geolocationData) {
      res.code = "4.00";

      return res.end(
        JSON.stringify({
          statusCode: "4.00",
          body: {
            message: "Bad Request",
            data: "Dados com formato inválido.",
          },
        })
      );
    }

    if (!validateDeviceId(deviceId)) {
      res.code = "4.01";

      return res.end(
        JSON.stringify({
          statusCode: "4.01",
          body: {
            message: "Unauthorized",
            data: "ID inválido ou não autenticado.",
          },
        })
      );
    }

    const sensorsData = {
      accelerometerData,
      gyroscopeData,
      geolocationData,
    };

    saveSensorsData(deviceId, sensorsData);

    const failResult = predict(sensorsData);

    res.code = "2.05";
    res.end(
      JSON.stringify({
        statusCode: "2.05",
        body: {
          message: "Content",
          data: JSON.stringify({ deviceId, sensorsData }), // Modificação para retornar os dados
        },
      })
    );
  } catch (error) {
    console.error("Erro ao processar o payload:", error);

    res.code = "4.00";
    res.end(
      JSON.stringify({
        statusCode: "4.00",
        body: {
          message: "Bad Request",
          data: "Erro ao processar o payload.",
        },
      })
    );
  }
}
