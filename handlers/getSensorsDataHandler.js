import { loadSensorsData } from "../utils/sensorsUtils.js";

export function getSensorsDataHandler(req, res) {
  console.log(req.query);
  const { deviceId } = req.query;

  if (!deviceId) {
    console.log("Erro ao receber deviceId.");
    res.code = "4.00";

    return res.end(
      JSON.stringify({
        statusCode: "4.00",
        body: {
          message: "Bad Request",
          data: {
            error: "DeviceId é necessário.",
          },
        },
      })
    );
  }

  try {
    const deviceData = loadSensorsData(deviceId);

    if (!deviceData) {
      console.log(`Nenhum dado encontrado para o dispositivo ID: ${deviceId}`);
      res.code = "4.04";

      return res.end(
        JSON.stringify({
          statusCode: "4.04",
          body: {
            message: "Not Found",
            data: {
              error: "Nenhum dado encontrado para o deviceId.",
            },
          },
        })
      );
    }

    const locationData = deviceData?.locationData;
    
    const lastfallPredictions = deviceData?.lastfallPrediction ?? [0]; 
    const lastfallPrediction = Array.isArray(lastfallPredictions) ? lastfallPredictions[lastfallPredictions.length - 1] : lastfallPredictions;
    
    const didFall = lastfallPrediction === 1;

    res.code = "2.05";
    res.end(
      JSON.stringify({
        statusCode: "2.05",
        body: {
          message: "Content",
          data: { locationData, didFall },
        },
      })
    );
  } catch (error) {
    console.error("Erro ao processar os dados do dispositivo:", error.message);

    res.code = "5.00";
    res.end(
      JSON.stringify({
        statusCode: "5.00",
        body: {
          message: "Internal Server Error",
          data: {
            error: "Erro ao processar os dados do dispositivo",
            details: error.message,
          },
        },
      })
    );
  }
}
