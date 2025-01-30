import { saveSensorsData } from "../utils/sensorsUtils.js";
import { validateDeviceId } from "../utils/deviceUtils.js";

const chunksStore = {};

export function postSensorsDataCaptureHandler(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);
    const { deviceId, chunk, index, totalChunks } = data;

    if (
      !deviceId ||
      chunk === undefined ||
      index === undefined ||
      totalChunks === undefined
    ) {
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

    if (!chunksStore[deviceId]) {
      chunksStore[deviceId] = { totalChunks, chunks: [] };
    }

    chunksStore[deviceId].chunks[index] = chunk;

    if (chunksStore[deviceId].chunks.filter(Boolean).length === totalChunks) {
      const completePayload = chunksStore[deviceId].chunks.join("");
      let parsedData;

      try {
        parsedData = JSON.parse(completePayload);
      } catch (error) {
        return res.end();
      }

      delete chunksStore[deviceId];

      const { accelerometerData, gyroscopeData, locationData } = parsedData;
      const sensorsData = { accelerometerData, gyroscopeData, locationData };

      console.log(JSON.stringify({ deviceId, sensorsData }));

      res.code = "2.05";
      res.end(
        JSON.stringify({
          statusCode: "2.05",
          body: {
            message: "Content",
            data: JSON.stringify({ deviceId }),
          },
        })
      );
    }
  } catch (error) {
    if (
      error.name !== "SyntaxError" ||
      error.message !== "Unexpected end of JSON input"
    ) {
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
}
