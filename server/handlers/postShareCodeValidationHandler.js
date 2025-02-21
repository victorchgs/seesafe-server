import { loadDevices } from "../utils/deviceUtils.js";

export function postShareCodeValidationHandler(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);
    const shareCode = data.code;

    if (!shareCode) {
      throw new Error("Código de compartilhamento não fornecido.");
    }

    const devices = loadDevices();
    const device = devices.find((device) => device.shareCode === shareCode);

    if (device) {
      console.log(
        `Código de compartilhamento válido para o dispositivo: ${device.id}`
      );

      res.code = "2.05";
      res.end(
        JSON.stringify({
          statusCode: "2.05",
          body: {
            message: "Código de compartilhamento válido",
            data: { deviceId: device.id },
          },
        })
      );
    } else {
      res.code = "4.04";
      res.end(
        JSON.stringify({
          statusCode: "4.04",
          body: {
            message: "Código de compartilhamento inválido",
          },
        })
      );
    }
  } catch (error) {
    console.error("Erro ao processar o payload:", error.message);

    res.code = "4.00";
    res.end(
      JSON.stringify({
        statusCode: "4.00",
        body: {
          message: "Erro ao processar o payload",
          details: error.message,
        },
      })
    );
  }
}
